import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, project_id, model_name, n_images = 1, params, is_playground = false } = body;
    
    // Check authentication only if not in playground mode
    if (!is_playground) {
      const supabase = await createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }
    
    if (!user_id || !project_id || !model_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Make the request to your Python backend API
    const backendUrl = 'http://localhost:8000';
    
    const response = await fetch(`${backendUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id,
        project_id,
        model_name,
        n_images,
        params,
        is_playground
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || "Failed to generate image" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json({ image_ids: data.image_paths });
    
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 