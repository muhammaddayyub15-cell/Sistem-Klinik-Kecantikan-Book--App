<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// NotificationController: Endpoint untuk frontend membaca notifikasi user.
// Semua notifikasi disimpan di tabel notifications via Laravel database channel.
class NotificationController extends Controller
{
    use ApiResponseTrait;

    // index: Ambil semua notifikasi user — unread duluan, lalu read.
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->get()
            ->map(fn ($n) => [
                'id'        => $n->id,
                'type'      => $n->data['type'],
                'title'     => $n->data['title'],
                'message'   => $n->data['message'],
                'data'      => $n->data,
                'read_at'   => $n->read_at,
                'is_read'   => !is_null($n->read_at),
                'created_at'=> $n->created_at,
            ]);

        return $this->successResponse($notifications);
    }

    // unread: Ambil hanya notifikasi yang belum dibaca — untuk badge count di frontend.
    public function unread(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->unreadNotifications()
            ->latest()
            ->get()
            ->map(fn ($n) => [
                'id'         => $n->id,
                'type'       => $n->data['type'],
                'title'      => $n->data['title'],
                'message'    => $n->data['message'],
                'data'       => $n->data,
                'created_at' => $n->created_at,
            ]);

        return $this->successResponse([
            'count'         => $notifications->count(),
            'notifications' => $notifications,
        ]);
    }

    // markAsRead: Tandai satu notifikasi sebagai sudah dibaca.
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->first();

        if (!$notification) {
            return $this->notFoundResponse('Notifikasi tidak ditemukan.');
        }

        $notification->markAsRead();

        return $this->successResponse(null, 'Notifikasi ditandai sudah dibaca.');
    }

    // markAllAsRead: Tandai semua notifikasi user sebagai sudah dibaca.
    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return $this->successResponse(null, 'Semua notifikasi ditandai sudah dibaca.');
    }
}