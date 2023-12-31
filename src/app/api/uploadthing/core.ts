import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { createUploadthing, type FileRouter } from "uploadthing/next";
// import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { PLANS } from "@/config/stripe";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { supabaseClient } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";

const f = createUploadthing();

const middleware = async () => {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }

  const subscriptionPlan = await getUserSubscriptionPlan();

  return { userId: user.id, subscriptionPlan };
};

const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>;
  file: {
    key: string;
    name: string;
    url: string;
  };
}) => {
  const isFileExist = await db.file.findFirst({
    where: {
      key: file.key,
    },
  });
  if (isFileExist) return;
  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.userId,
      url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
      uploadStatus: "PROCESSING",
    },
  });

  try {
    const response = await fetch(
      `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`
    );
    const blob = await response.blob();

    const loader = new PDFLoader(blob);

    const pageLevelDocs = await loader.load();

    const pagesAmt = pageLevelDocs.length;
    const { subscriptionPlan } = metadata;
    const { isSubscribed } = subscriptionPlan;

    const isProExceeded =
      pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf;
    const isFreeExceeded =
      pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf;
    if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
      await db.file.update({
        data: {
          uploadStatus: "FAILED",
        },
        where: {
          id: createdFile.id,
        },
      });
    }

    // console.log(pageLevelDocs);

    // const supabaseClient = createClient(
    //   "https://xegtxhofasgyhsobwelg.supabase.co",
    //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZ3R4aG9mYXNneWhzb2J3ZWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTc1NjQwMTQsImV4cCI6MjAxMzE0MDAxNH0.gGPti5VCUnCmkZbbX5AV1qPLHEEUpdzQwBq8xHVlEA4"
    // );

    // vectorize and index entire document
    // const pinecone = await getPineconeClient();
    // const pineconeIndex = pinecone.Index("quill");

    // const embeddings = new OpenAIEmbeddings({
    //   openAIApiKey: process.env.OPENAI_API_KEY,
    // });
    // console.log(embeddings);

    // await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
    //   pineconeIndex,
    //   namespace: createdFile.id,
    // });
    const pdfContent = pageLevelDocs[0].pageContent;
    const pdfMetadata = pageLevelDocs[0].metadata;

    // Create an array of content and metadata
    const contentArray = pdfContent.split("\n");
    const metadataArray = [
      ...Array(contentArray.length).fill({ namespace: createdFile.id }),
    ];
    const client = <SupabaseClient>supabaseClient;
    const vectorStore = await SupabaseVectorStore.fromTexts(
      contentArray,
      metadataArray,
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      }),
      {
        client,
        tableName: "documents",
        queryName: "match_documents",
      }
    );

    // await supabaseClient.from("documents").insert({
    //   content: pageLevelDocs,
    //   embeddings,
    // });

    await db.file.update({
      data: {
        uploadStatus: "SUCCESS",
      },
      where: {
        id: createdFile.id,
      },
    });
  } catch (err) {
    console.log(err);
    await db.file.update({
      data: {
        uploadStatus: "FAILED",
      },
      where: {
        id: createdFile.id,
      },
    });
  }
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  freePlanUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
