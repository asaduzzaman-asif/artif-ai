import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

// Cloudinary কনফিগারেশন
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in first." }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, imageType, imageBase64 } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    await connectToDatabase();

    let user = await User.findOne({ clerkId: clerkUser.id });
    
    // আজকের তারিখ বের করা (যেমন: "2026-10-09")
    const today = new Date().toISOString().split("T")[0];

    // যদি ইউজার ডেটাবেসে না থাকে
    if (!user) {
      user = await User.create({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        credits: 5,
        lastResetDate: today,
      });
    } else {
      // ডেইলি রিসেট চেক: যদি ডেটাবেসের তারিখ আজকের তারিখের সমান না হয়, তবে ক্রেডিট আবার ৫ করে দাও
      if (user.lastResetDate !== today) {
        user.credits = 5;
        user.lastResetDate = today;
        await user.save();
      }
    }

    // যদি আজকের ৫টি ক্রেডিটই শেষ হয়ে যায়
    if (user.credits <= 0) {
      return NextResponse.json(
        { error: "Your daily free credits are over. Please come back tomorrow for new credits!" }, 
        { status: 403 }
      );
    }

    let uploadedImageUrl = null;

    if (imageType === "poster" && imageBase64) {
      const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
        folder: "artif_ai_samples",
      });
      uploadedImageUrl = uploadResponse.secure_url;
    }

    // ছবি জেনারেট করা
    const finalPrompt = imageType === "poster" 
      ? `A professional social media poster advertisement for: ${prompt}, high quality, beautiful graphic design` 
      : prompt;

    const encodedPrompt = encodeURIComponent(finalPrompt);
    const aiImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

    // সফলভাবে ছবি জেনারেট হওয়ার পর ১টি ক্রেডিট কেটে নেওয়া
    user.credits -= 1;
    await user.save();

    return NextResponse.json({
      success: true,
      imageUrl: aiImageUrl,
      referenceImage: uploadedImageUrl,
      creditsLeft: user.credits,
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong in the API!" },
      { status: 500 }
    );
  }
}