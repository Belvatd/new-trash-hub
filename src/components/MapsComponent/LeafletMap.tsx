"use client"

import "leaflet/dist/leaflet.css"
import { useEffect, useRef, useState, memo } from "react"
import { type TGoogleMaps, type TLatLng } from "./type"
import { defaultLatLng } from "./constants"

const LeafletMap = ({
  center,
  onSubmit,
  draggable = true,
  isLoadingMarker,
  onClickSelect,
  mapContainerClassName,
  withDetailAddress,
}: TGoogleMaps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [latLng, setLatLng] = useState<TLatLng>(center || defaultLatLng)
  const [address, setAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      )
      const data = await res.json()
      const fullAddress = data.display_name || ""
      setAddress(fullAddress)

      onSubmit &&
        onSubmit({
          addressName: data.address?.road || data.address?.suburb || "",
          addressSecondary: fullAddress,
          placeId: "",
          lat,
          lng,
        })
    } catch {
      setAddress("")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Leaflet hanya bisa dijalankan di browser (bukan SSR)
    if (typeof window === "undefined" || !mapRef.current) return

    // Gunakan flag `cancelled` untuk handle React StrictMode double-invoke:
    // Cleanup berjalan -> cancelled=true -> async initMap() akan di-skip walau sudah mulai
    let cancelled = false

    const initMap = async () => {
      const L = (await import("leaflet")).default

      // Setelah await, cek apakah cleanup sudah berjalan atau container sudah punya map
      if (cancelled || !mapRef.current) return
      if ((mapRef.current as any)._leaflet_id) return

      // Fix ikon default Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const initLatLng = {
        lat: center?.lat ?? defaultLatLng.lat,
        lng: center?.lng ?? defaultLatLng.lng,
      }
      const map = L.map(mapRef.current!, {
        center: [initLatLng.lat, initLatLng.lng],
        zoom: 16,
        dragging: draggable !== false,
        zoomControl: true,
      })

      // Cek lagi setelah L.map() — jika cancelled, langsung destroy dan keluar
      if (cancelled) {
        map.remove()
        return
      }

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      const marker = L.marker([initLatLng.lat, initLatLng.lng], {
        draggable: draggable !== false,
      }).addTo(map)

      markerRef.current = marker
      mapInstanceRef.current = map

      // Paksa Leaflet hitung ulang ukuran container agar tile tidak offset
      setTimeout(() => {
        if (!cancelled) map.invalidateSize()
      }, 100)

      // Saat peta di-drag, pindahkan marker ke tengah
      if (draggable !== false) {
        map.on("moveend", () => {
          const c = map.getCenter()
          if (c.lat == null || c.lng == null || isNaN(c.lat) || isNaN(c.lng)) return
          marker.setLatLng([c.lat, c.lng])
          void reverseGeocode(c.lat, c.lng)
          setLatLng({ lat: c.lat, lng: c.lng })
        })
      }

      // Geocode posisi awal
      void reverseGeocode(initLatLng.lat, initLatLng.lng)
    }

    void initMap()

    return () => {
      cancelled = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update posisi marker dan peta saat `center` prop berubah
  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !markerRef.current ||
      !center ||
      center.lat == null ||
      center.lng == null ||
      isNaN(center.lat) ||
      isNaN(center.lng)
    ) return
    mapInstanceRef.current.invalidateSize()
    mapInstanceRef.current.setView([center.lat, center.lng], 16)
    markerRef.current.setLatLng([center.lat, center.lng])
    setLatLng(center)
  }, [center])

  // Invalidate size saat loading marker selesai untuk mengantisipasi perubahan dimensi layout
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize()
      }, 250)
    }
  }, [isLoadingMarker])

  return (
    <>
      {!center && (
        <button
          className="absolute bottom-0 left-0 right-0 top-0 z-[1002] m-auto h-[34px] w-[92px] rounded-xl bg-white px-3 py-2 text-xs font-semibold text-gray-700"
          onClick={(event) => {
            event.preventDefault()
            return onClickSelect && onClickSelect()
          }}
        >
          Pilih di peta
        </button>
      )}

      <div
        ref={mapRef}
        className={mapContainerClassName}
        style={{ height: "100%", width: "100%" }}
      />

      {isLoadingMarker && (
        <div className="absolute inset-0 z-[1003] flex items-center justify-center bg-white/50">
          <span className="text-sm text-gray-500">Memuat peta...</span>
        </div>
      )}

      {withDetailAddress && (
        <div className="py-4">
          {isLoading ? (
            "loading..."
          ) : (
            <p className="text-sm text-gray-600">{address}</p>
          )}
        </div>
      )}
    </>
  )
}

export default memo(LeafletMap)
