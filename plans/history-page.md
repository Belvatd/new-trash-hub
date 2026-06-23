# Plan: Customer Order History Page

## Latar Belakang
Pengguna membutuhkan halaman riwayat (History) untuk melihat daftar pesanan *pick-up* yang sudah tidak aktif (seperti status `DONE` atau `CANCELLED`). Saat ini, pengguna hanya bisa melihat transaksi yang sedang berlangsung di beranda.

## Open Questions
1. **Poin XP**: Saat ini komponen `OrderCard` meng-hardcode poin sebesar `+20xp`. Apakah kita perlu mengambil poin dari relasi tabel `trash` agar dinamis, atau menyembunyikannya untuk versi ini?
2. **Tanggal Selesai**: Apakah kita menggunakan `createdDate` untuk ditampilkan pada kartu riwayat, atau ada kolom khusus untuk tanggal selesai?

## Proposed Changes

### Data Fetching Hook (`useGetOrderHistory`)
- **File**: `src/hooks/services/CustomerOrders/service.ts`
- Tambahkan hook baru `useGetOrderHistory` yang melakukan *query* ke `customer_orders` dengan memfilter status yang tidak aktif (misal: `"DONE"`, `"CANCELLED"`).
- Urutkan hasil berdasarkan `createdDate` secara *descending*.
- Jika memungkinkan, sertakan relasi `trash(points, name)` agar kita mendapatkan data poin dan nama sampah untuk ditampilkan di kartu riwayat.

### UI Components (`OrderCard.tsx`)
- **File**: `src/components/OrderCard/OrderCard.tsx`
- Tambahkan *prop* opsional `date?: string` untuk menampilkan tanggal pesanan alih-alih menggunakan `new Date()`.
- Tambahkan *prop* opsional `points?: number` untuk menggantikan hardcode `+20xp`.
- Update `getStatusLabel` untuk mengakomodasi status `CANCELLED` (misalnya menjadi "Dibatalkan").

### History Page (`page.tsx`)
- **File**: `src/app/(restricted-page)/customer/history/page.tsx`
- Buat halaman baru dengan *routing* `/customer/history`.
- Tampilkan `ServiceHeader` dengan judul "Riwayat Transaksi" dan tombol kembali ke halaman profil/beranda.
- Panggil hook `useGetOrderHistory`.
- Tampilkan kondisi *loading* (menggunakan `BounceLoader`).
- Jika data kosong, tampilkan *empty state* (pesan bahwa belum ada riwayat).
- Render `OrderCard` untuk setiap pesanan dalam bentuk *list*, atur `isOngoing={false}` dan teruskan data secara dinamis.
