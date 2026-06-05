<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

// ApiResponseTrait: format response JSON konsisten di semua controller
trait ApiResponseTrait
{
    // successResponse: 200 OK — data berhasil diambil atau diproses
    protected function successResponse(mixed $data, ?string $message = null, int $code = 200): JsonResponse
    {
        return response()->json([
            'status'  => 'success',
            'message' => $message,
            'data'    => $data,
        ], $code);
    }

    // createdResponse: 201 Created — resource berhasil dibuat
    protected function createdResponse(mixed $data, ?string $message = null): JsonResponse
    {
        return $this->successResponse($data, $message, 201);
    }

    // errorResponse: response error dengan pesan dan optional errors array
    // $errors: diisi $e->errors() dari ValidationException untuk detail field errors
    protected function errorResponse(string $message, int $code = 400, array $errors = []): JsonResponse
    {
        return response()->json([
            'status'  => 'error',
            'message' => $message,
            'errors'  => $errors,
        ], $code);
    }

    // validationErrorResponse: 422 khusus ValidationException — shortcut agar controller tidak verbose
    // dipanggil: $this->validationErrorResponse($e->errors())
    protected function validationErrorResponse(array $errors, string $message = 'Validation failed.'): JsonResponse
    {
        return $this->errorResponse($message, 422, $errors);
    }

    // notFoundResponse: 404 — resource tidak ditemukan
    protected function notFoundResponse(string $message = 'Resource not found.'): JsonResponse
    {
        return $this->errorResponse($message, 404);
    }
}