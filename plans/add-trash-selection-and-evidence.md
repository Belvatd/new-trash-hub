# Plan: Add Trash Selection and Evidence Upload to Create Order

## Latar Belakang
Saat ini, flow `create-order` hanya menerima lokasi dan catatan (order notes & address notes), namun belum memasukkan pemilihan jenis sampah (`trashId`) dan bukti gambar sampah (`trashPicture`). Keduanya perlu ditambahkan agar pesanan sesuai dengan skema database `customer_orders`.

## Solusi yang Diusulkan

1. **Buat Hook untuk Mengambil List Sampah**
   - Buat hook `useGetAllTrashes` di `src/hooks/services/CustomerOrders/service.ts` untuk melakukan query ke tabel `trash`.
   
2. **Buat Komponen UI Reusable**
   - **`FormSelect`**: Komponen dropdown yang terintegrasi dengan `react-hook-form` untuk memilih jenis sampah.
   - **`FormImageUpload`**: Komponen untuk mengunggah gambar bukti. Gambar ini perlu diunggah ke Supabase Storage (bucket tertentu) agar kita mendapatkan URL publik yang kemudian disimpan di database.
   
3. **Integrasikan ke Halaman Create Order**
   - Di `src/app/(restricted-page)/customer/create-order/page.tsx`, tambahkan input `FormSelect` (berisi list sampah dari `useGetAllTrashes`) dan `FormImageUpload`.
   - Update `onSubmit` payload untuk memasukkan `trashId` dan `trashPicture` dari form, yang sebelumnya di-hardcode string kosong.

## File yang Akan Dimodifikasi
- `src/hooks/services/CustomerOrders/service.ts`
- `src/app/(restricted-page)/customer/create-order/page.tsx`
- `src/components/FormSelect/FormSelect.tsx` (Baru)
- `src/components/FormImageUpload/FormImageUpload.tsx` (Baru)
- `src/hooks/services/CustomerOrders/model.ts` (Pastikan tipe schema validasi sesuai)

## Pertanyaan Terbuka / Asumsi
- **Supabase Storage Bucket**: Apa nama bucket Supabase yang digunakan untuk mengunggah bukti foto sampah? (Misal: `evidences` atau `trash_pictures`). Jika belum ada, apakah saya perlu membuat bucket tersebut via MCP atau akan menggunakan URL sementara berbasis base64? (gunakan mcp untuk membuat bucket)
