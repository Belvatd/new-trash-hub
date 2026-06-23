import { z } from "zod";

export const CreateOrderSchema = z.object({
    customerId : z.string(),
    addressNotes: z.string().optional(),
    orderNotes: z.string().optional(),
    trashPicture: z.string({ required_error: "Foto sampah wajib diunggah" }).min(1, "Foto sampah wajib diunggah"),
    pinpoint: z.object({
        _lat: z.number(),
        _long: z.number(),
    }),
    status: z.string(),
    createdDate: z.string(),
    trashId: z.string({ required_error: "Pilih jenis sampah" }).min(1, "Pilih jenis sampah"),
    fullAddress: z.string(),
    cleanerId: z.string().optional(),
})

export type CreateOrderType = z.infer<typeof CreateOrderSchema>