import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Lembar | Ubah Google Sheets Jadi REST API";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          padding: "60px",
          border: "16px solid #000000",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                backgroundColor: "#ffe600",
                border: "4px solid #000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "4px 4px 0px #000000",
              }}
            >
              <div style={{ fontSize: "32px", fontWeight: "900", color: "#000000" }}>L</div>
            </div>
            <div style={{ fontSize: "28px", fontWeight: "900", letterSpacing: "4px", color: "#000000" }}>
              LEMBAR API
            </div>
          </div>
          <div
            style={{
              backgroundColor: "#ffe600",
              color: "#000000",
              padding: "8px 20px",
              border: "3px solid #000000",
              fontWeight: "900",
              fontSize: "18px",
              textTransform: "uppercase",
              boxShadow: "3px 3px 0px #000000",
            }}
          >
            Google Sheets to REST API
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: "64px",
              fontWeight: "900",
              lineHeight: 1.1,
              color: "#000000",
              textTransform: "uppercase",
            }}
          >
            Ubah Spreadsheet Jadi REST API Instan.
          </div>
          <div
            style={{
              fontSize: "26px",
              fontWeight: "600",
              color: "#4b5563",
              maxWidth: "950px",
            }}
          >
            Single OAuth Consent &bull; Auto-Create Tab & Headers &bull; Siap untuk Low-Code, Webhook & Proyek Developer.
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "4px solid #000000",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "24px" }}>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#000000" }}>
              ⚡ CRUD Lengkap (GET, POST, PUT, DELETE)
            </div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#000000" }}>
              🔒 AES-256-GCM
            </div>
          </div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#000000" }}>
            lembar.atnan.my.id
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
