import { NextResponse } from "next/server";

interface ApiResponse<T = any> {
  status: number;
  message?: string;
  data?: T;
}

function ResponseData<T>(response: ApiResponse<T>): NextResponse {
  const { status, message, data } = response;
  const responseBody: Omit<ApiResponse<T>, "status"> = {};

  if (message) responseBody.message = message;
  if (data) responseBody.data = data;

  return NextResponse.json(responseBody, { status });
}

export default ResponseData;
