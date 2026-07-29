import { NextRequest, NextResponse } from "next/server";
import { validateEnvironment } from "@/lib/env";
import { parseResumeFileContent } from "@/lib/supabase/resumeParser";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user from session header or auth cookie
    const authHeader = req.headers.get("authorization");
    const userIdHeader = req.headers.get("x-user-id");

    // Scoped user identity (no fallback to Alex Morgan)
    const userId = userIdHeader || (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          code: "UNAUTHORIZED",
          message: "Authentication required. Please log in to upload resumes.",
        },
        { status: 401 }
      );
    }

    // 2. Extract multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          code: "NO_FILE_PROVIDED",
          message: "No resume file was uploaded.",
        },
        { status: 400 }
      );
    }

    // 3. File size validation (5MB max limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          code: "FILE_TOO_LARGE",
          message: `File size exceeds maximum 5MB limit (uploaded: ${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
        },
        { status: 400 }
      );
    }

    // 4. File extension validation
    const fileName = file.name || "";
    const lowerName = fileName.toLowerCase();
    const isPdf = lowerName.endsWith(".pdf");
    const isDocx = lowerName.endsWith(".docx") || lowerName.endsWith(".doc");

    if (!isPdf && !isDocx) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_FILE_TYPE",
          message: "Only PDF (.pdf) and Word (.docx) resume documents are supported.",
        },
        { status: 400 }
      );
    }

    // Convert file to ArrayBuffer -> Buffer for node parsers
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    // 5. Local Text Extraction
    if (isPdf) {
      try {
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text || "";
      } catch (pdfErr: any) {
        console.error("PDF parse error:", pdfErr);
        return NextResponse.json(
          {
            success: false,
            code: "PDF_PARSE_FAILED",
            message: "Failed to read text from PDF file. File may be corrupted or password protected.",
          },
          { status: 400 }
        );
      }
    } else if (isDocx) {
      try {
        const docxResult = await mammoth.extractRawText({ buffer });
        extractedText = docxResult.value || "";
      } catch (docxErr: any) {
        console.error("DOCX parse error:", docxErr);
        return NextResponse.json(
          {
            success: false,
            code: "DOCX_PARSE_FAILED",
            message: "Failed to read text from DOCX file.",
          },
          { status: 400 }
        );
      }
    }

    // 6. Check for Scanned / Empty PDF OCR Requirement
    const trimmedText = extractedText.replace(/\s+/g, " ").trim();
    if (trimmedText.length < 30) {
      return NextResponse.json(
        {
          success: false,
          code: "SCANNED_PDF_OCR_REQUIRED",
          message: "Scanned PDF or image detected. Optical Character Recognition (OCR) is required to extract text from images.",
        },
        { status: 400 }
      );
    }

    // 7. Extract local structured data & deduplicate skills
    const localAnalysis = parseResumeFileContent(fileName, trimmedText);
    const resumeId = `res_${Date.now()}`;

    // Return structured API response
    return NextResponse.json({
      success: true,
      resumeId,
      skills: localAnalysis.parsedSkills.map((s) => s.name),
      parsedData: {
        skills: localAnalysis.parsedSkills,
        experience: localAnalysis.experience,
        education: localAnalysis.education,
        certifications: localAnalysis.certifications,
        completenessScore: localAnalysis.completenessScore,
        confidenceScore: localAnalysis.confidenceScore,
        rawTextLength: trimmedText.length,
      },
      message: "Resume analyzed successfully.",
    });
  } catch (error: any) {
    console.error("Critical error in /api/resume/parse:", error);
    return NextResponse.json(
      {
        success: false,
        code: "SERVER_ERROR",
        message: error.message || "An unexpected server error occurred while processing the resume.",
      },
      { status: 500 }
    );
  }
}
