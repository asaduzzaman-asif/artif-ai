import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    let user = await User.findOne({ clerkId: clerkUser.id });
    
    // আজকের তারিখ বের করা
    const today = new Date().toISOString().split("T")[0];

    // ইউজার না থাকলে বা তারিখ পরিবর্তন হলে ক্রেডিট আপডেট করা
    if (!user) {
      user = await User.create({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        credits: 5,
        lastResetDate: today,
      });
    } else if (user.lastResetDate !== today) {
      user.credits = 5;
      user.lastResetDate = today;
      await user.save();
    }

    return NextResponse.json({ credits: user.credits });
  } catch (error: any) {
    console.error("User API Error:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}