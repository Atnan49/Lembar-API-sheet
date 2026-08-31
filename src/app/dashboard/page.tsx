"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import {
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  ExternalLink,
  Database,
  Code2,
  Activity,
  Layers,
  AlertTriangle,
  Zap,
  Sparkles,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

interface ConnectedSheetItem {
  id: string;
  spreadsheetId: string;
  spreadsheetName: string;
  apiKey: string;
  apiKeyPrefix: string;
  requestCount: number;
  quotaLimit: number;
  quotaResetAt: string;
  createdAt: string;
  _count?: {
    usageLogs: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [sheets, setSheets] = useState<ConnectedSheetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isCreateTabModalOpen, setIsCreateTabModalOpen] = useState(false);
  const [selectedSheetForTab, setSelectedSheetForTab] = useState<ConnectedSheetItem | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [selectedSheetForCode, setSelectedSheetForCode] = useState<ConnectedSheetItem | null>(null);

  // Connect sheet form
  const [sheetUrlInput, setSheetUrlInput] = useState("");
  const [customNameInput, setCustomNameInput] = useState("");
  const [isSubmittingConnect, setIsSubmittingConnect] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Create tab form
  const [tabNameInput, setTabNameInput] = useState("");
  const [headersInput, setHeadersInput] = useState("");
  const [isSubmittingTab, setIsSubmittingTab] = useState(false);
  const [tabError, setTabError] = useState<string | null>(null);
  const [tabSuccessMessage, setTabSuccessMessage] = useState<string | null>(null);

  // Survey modal state
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyTag, setSurveyTag] = useState("");

  // Visible API keys mapping
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Code modal language
  const [codeLang, setCodeLang] = useState<"curl" | "fetch" | "php" | "python">("curl");

  // Billing state
  const [userPlan, setUserPlan] = useState<"FREE" | "PRO">("FREE");
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Fetch billing status
  const fetchBillingStatus = async () => {
    try {
      const res = await fetch("/api/billing/status");
      const json = await res.json();
      if (json.success) {
        setUserPlan(json.plan);
        setPlanExpiresAt(json.planExpiresAt);
      }
    } catch {
      // ignore transient error
    }
  };

  // Fetch connected sheets
  const fetchSheets = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/sheets");
      const json = await res.json();
      if (json.success) {
        setSheets(json.sheets || []);
      } else {
        setErrorMessage(json.error || "Gagal memuat data spreadsheet.");
      }
    } catch {
      setErrorMessage("Koneksi bermasalah saat mengambil data spreadsheet.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchSheets();
      fetchBillingStatus();
      if (!session.user?.segmentTag) {
        setShowSurvey(true);
      }
      if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("upgrade") === "true") {
        setIsUpgradeModalOpen(true);
      }
    }
  }, [status, session]);

  // Handle upgrade checkout via Pakasir QRIS
  const handleUpgradeCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const json = await res.json();
      if (json.success && json.paymentUrl) {
        window.location.href = json.paymentUrl;
      } else {
        alert(json.error || "Gagal membuat sesi pembayaran Pakasir.");
      }
    } catch {
      alert("Kesalahan jaringan saat menghubungi payment gateway.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const toggleKeyVisibility = (sheetId: string) => {
    setVisibleKeys((prev) => ({ ...prev, [sheetId]: !prev[sheetId] }));
  };

  // Connect sheet handler
  const handleConnectSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetUrlInput.trim()) {
      setConnectError("Mohon masukkan URL Google Sheets.");
      return;
    }

    setIsSubmittingConnect(true);
    setConnectError(null);

    try {
      const res = await fetch("/api/sheets/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spreadsheetUrl: sheetUrlInput.trim(),
          customName: customNameInput.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSheetUrlInput("");
        setCustomNameInput("");
        setIsConnectModalOpen(false);
        fetchSheets();
      } else {
        setConnectError(json.error || "Gagal menghubungkan spreadsheet.");
      }
    } catch {
      setConnectError("Terjadi kesalahan jaringan saat menghubungkan sheet.");
    } finally {
      setIsSubmittingConnect(false);
    }
  };

  // Disconnect sheet handler
  const handleDisconnectSheet = async (sheet: ConnectedSheetItem) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin memutuskan spreadsheet "${sheet.spreadsheetName}"? API Key ini tidak akan dapat digunakan lagi.`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/sheets/${sheet.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setSheets((prev) => prev.filter((s) => s.id !== sheet.id));
      } else {
        alert(json.error || "Gagal memutuskan sheet.");
      }
    } catch {
      alert("Kesalahan jaringan saat menghapus koneksi.");
    }
  };

  // Regenerate API Key handler
  const handleRegenerateKey = async (sheetId: string) => {
    const confirmRegen = window.confirm(
      "Apakah Anda yakin ingin merotasi API Key? Kunci lama akan langsung tidak berlaku."
    );
    if (!confirmRegen) return;

    try {
      const res = await fetch(`/api/sheets/${sheetId}/regenerate-key`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        fetchSheets();
      } else {
        alert(json.error || "Gagal merotasi API key.");
      }
    } catch {
      alert("Kesalahan jaringan saat rotasi key.");
    }
  };

  // Create tab handler
  const handleCreateTab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSheetForTab || !tabNameInput.trim() || !headersInput.trim()) {
      setTabError("Nama tab dan kolom header wajib diisi.");
      return;
    }

    setIsSubmittingTab(true);
    setTabError(null);
    setTabSuccessMessage(null);

    const headersArray = headersInput
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);

    if (headersArray.length === 0) {
      setTabError("Minimal satu nama kolom header diperlukan.");
      setIsSubmittingTab(false);
      return;
    }

    try {
      const res = await fetch(`/api/sheets/${selectedSheetForTab.id}/create-tab`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tabName: tabNameInput.trim(),
          headers: headersArray,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setTabSuccessMessage(`Tab "${tabNameInput.trim()}" berhasil dibuat dengan ${headersArray.length} header.`);
        setTabNameInput("");
        setHeadersInput("");
        setTimeout(() => {
          setIsCreateTabModalOpen(false);
          setTabSuccessMessage(null);
        }, 1800);
      } else {
        setTabError(json.error || "Gagal membuat tab baru.");
      }
    } catch {
      setTabError("Kesalahan jaringan saat membuat tab.");
    } finally {
      setIsSubmittingTab(false);
    }
  };

  // Submit survey handler
  const handleSubmitSurvey = async (tag: string) => {
    setSurveyTag(tag);
    try {
      await fetch("/api/user/segment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segmentTag: tag }),
      });
      setShowSurvey(false);
    } catch {
      setShowSurvey(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-black border-t-[#ffe600] animate-spin" />
        <p className="text-xs font-extrabold uppercase tracking-wider text-black mt-4">
          Memuat data dashboard...
        </p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <Card accent="yellow">
          <CardHeader>
            <div className="w-10 h-10 bg-[#ffe600] border-2 border-black flex items-center justify-center mb-3">
              <Database className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <CardTitle>Akses Dashboard</CardTitle>
            <CardDescription>
              Masuk dengan akun Google Anda untuk mengelola connected sheets dan API key.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              Masuk dengan Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-3 border-black pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-black">
              Dashboard Sheets
            </h1>
            {userPlan === "PRO" ? (
              <Badge variant="yellow" className="bg-[#ffe600] text-black border-2 border-black flex items-center gap-1">
                <Sparkles className="w-3 h-3 stroke-[3]" />
                <span>PRO PLAN</span>
              </Badge>
            ) : (
              <Badge variant="black">FREE (1.000 Req)</Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-zinc-700 font-medium mt-1">
            Akun: <span className="font-bold text-black">{session?.user?.email}</span>
            {userPlan === "PRO" && planExpiresAt && (
              <span className="ml-2 text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 border border-green-600">
                Aktif s/d {new Date(planExpiresAt).toLocaleDateString("id-ID")}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {userPlan !== "PRO" && (
            <Button
              variant="secondary"
              size="md"
              className="bg-[#ffe600] text-black hover:bg-black hover:text-white border-2 border-black shadow-[3px_3px_0px_#000000]"
              onClick={() => setIsUpgradeModalOpen(true)}
            >
              <Zap className="w-4 h-4 fill-current stroke-[2.5]" />
              <span>Upgrade PRO (Rp 49rb)</span>
            </Button>
          )}

          <Button variant="primary" size="md" onClick={() => setIsConnectModalOpen(true)}>
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Hubungkan Sheet</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="border-2 border-black p-12 bg-white flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-3 border-black border-t-[#ffe600] animate-spin" />
          <p className="text-xs font-extrabold uppercase tracking-wider text-black mt-4">
            Mengambil daftar spreadsheet...
          </p>
        </div>
      ) : errorMessage ? (
        <div className="border-2 border-black p-8 bg-white border-t-[6px] border-t-[#ff3b30] shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-[#ff3b30] stroke-[2.5]" />
            <h2 className="text-base font-extrabold uppercase tracking-wider text-black">
              Terjadi Kesalahan
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-700 font-medium mb-4">{errorMessage}</p>
          <Button variant="secondary" size="sm" onClick={fetchSheets}>
            Coba Lagi
          </Button>
        </div>
      ) : sheets.length === 0 ? (
        /* Empty State (R-27 compliant) */
        <div className="border-3 border-black p-8 sm:p-14 bg-white shadow-[6px_6px_0px_#000000] text-center max-w-2xl mx-auto flex flex-col items-center">
          <div className="w-14 h-14 bg-zinc-100 border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_#000000]">
            <Database className="w-7 h-7 text-black stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-extrabold uppercase tracking-wider text-black mb-2">
            Belum Ada Spreadsheet Terhubung
          </h2>
          <p className="text-xs sm:text-sm text-zinc-700 font-medium max-w-md mb-6">
            Ubah spreadsheet Google Sheets Anda menjadi REST API dengan sekali klik. Cukup tempel link dokumen Sheets Anda.
          </p>
          <Button variant="primary" size="md" onClick={() => setIsConnectModalOpen(true)}>
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Hubungkan Spreadsheet Pertama</span>
          </Button>
        </div>
      ) : (
        /* Sheets Grid */
        <div className="flex flex-col gap-6">
          {sheets.map((sheet) => {
            const isKeyVisible = visibleKeys[sheet.id] || false;
            const quotaPercent = Math.min(100, Math.round((sheet.requestCount / sheet.quotaLimit) * 100));

            return (
              <div
                key={sheet.id}
                className="border-3 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] flex flex-col gap-6"
              >
                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#ffe600] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000]">
                      <Database className="w-5 h-5 text-black stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-lg font-extrabold uppercase tracking-wider text-black">
                          {sheet.spreadsheetName}
                        </h2>
                        <a
                          href={`https://docs.google.com/spreadsheets/d/${sheet.spreadsheetId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-black hover:bg-zinc-100 border border-black"
                          title="Buka di Google Sheets"
                        >
                          <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                        </a>
                      </div>
                      <div className="text-xs font-mono text-zinc-600 mt-0.5">
                        ID: {sheet.spreadsheetId}
                      </div>
                    </div>
                  </div>

                  {/* Quota Tracker */}
                  <div className="flex flex-col items-start md:items-end gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-black">
                        Kuota Bulan Ini:
                      </span>
                      <span className="font-mono text-xs font-extrabold text-black bg-zinc-100 px-2 py-0.5 border border-black">
                        {sheet.requestCount} / {sheet.quotaLimit} Req
                      </span>
                    </div>
                    <div className="w-44 h-3 bg-zinc-100 border-2 border-black overflow-hidden">
                      <div
                        className="h-full bg-[#ffe600] border-r-2 border-black transition-all"
                        style={{ width: `${quotaPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* API Key Box */}
                <div className="bg-zinc-50 border-2 border-black p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-black shrink-0">
                      API Key:
                    </span>
                    <code className="font-mono text-xs font-bold text-black truncate bg-white px-2.5 py-1 border border-black">
                      {isKeyVisible ? sheet.apiKey : `${sheet.apiKeyPrefix}`}
                    </code>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleKeyVisibility(sheet.id)}
                      className="p-1.5 border-2 border-black bg-white hover:bg-zinc-100 text-black active:translate-x-[1px] active:translate-y-[1px]"
                      title={isKeyVisible ? "Sembunyikan API key" : "Tampilkan API key"}
                    >
                      {isKeyVisible ? (
                        <EyeOff className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </button>

                    <button
                      onClick={() => handleCopy(sheet.id, sheet.apiKey)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold uppercase bg-white border-2 border-black hover:bg-black hover:text-white transition-all active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      {copiedKeyId === sheet.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Salin Key</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedSheetForTab(sheet);
                        setIsCreateTabModalOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Bikin Tab Baru</span>
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedSheetForCode(sheet);
                        setIsCodeModalOpen(true);
                      }}
                    >
                      <Code2 className="w-4 h-4 stroke-[2.5]" />
                      <span>Contoh Kode API</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRegenerateKey(sheet.id)}
                      title="Rotasi API Key"
                    >
                      <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Rotasi Key</span>
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDisconnectSheet(sheet)}
                      title="Putuskan koneksi"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Putuskan</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connect Sheet Modal */}
      <Modal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        title="Hubungkan Google Sheets"
        description="Tempelkan URL spreadsheet Google Sheets yang ingin diubah menjadi REST API."
      >
        <form onSubmit={handleConnectSheet} className="flex flex-col gap-4">
          <Input
            label="URL atau ID Spreadsheet"
            placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
            value={sheetUrlInput}
            onChange={(e) => setSheetUrlInput(e.target.value)}
            required
            helperText="Pastikan akun Google Anda memiliki akses edit ke spreadsheet tersebut."
          />

          <Input
            label="Nama Kustom (Opsional)"
            placeholder="Contoh: Database Peserta Webinar"
            value={customNameInput}
            onChange={(e) => setCustomNameInput(e.target.value)}
          />

          {connectError && (
            <div className="p-3 bg-[#ff3b30]/10 border-2 border-[#ff3b30] text-[#ff3b30] text-xs font-bold">
              {connectError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsConnectModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isSubmittingConnect}>
              Hubungkan Sheet
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Tab Modal */}
      <Modal
        isOpen={isCreateTabModalOpen}
        onClose={() => {
          setIsCreateTabModalOpen(false);
          setTabError(null);
          setTabSuccessMessage(null);
        }}
        title="Bikin Tab Baru & Kolom Header"
        description={`Menambahkan tab baru ke spreadsheet "${selectedSheetForTab?.spreadsheetName}".`}
      >
        <form onSubmit={handleCreateTab} className="flex flex-col gap-4">
          <Input
            label="Nama Tab Lembar Kerja"
            placeholder="Contoh: RekapAbsen, Pendaftaran, Transaksi"
            value={tabNameInput}
            onChange={(e) => setTabNameInput(e.target.value)}
            required
          />

          <Input
            label="Daftar Kolom Header (Pisahkan dengan koma)"
            placeholder="nama, email, nomor_hp, status, institusi"
            value={headersInput}
            onChange={(e) => setHeadersInput(e.target.value)}
            required
            helperText="Kolom-kolom ini akan otomatis ditulis pada baris 1 tab baru."
          />

          {tabError && (
            <div className="p-3 bg-[#ff3b30]/10 border-2 border-[#ff3b30] text-[#ff3b30] text-xs font-bold">
              {tabError}
            </div>
          )}

          {tabSuccessMessage && (
            <div className="p-3 bg-[#ffe600] border-2 border-black text-black text-xs font-extrabold">
              {tabSuccessMessage}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsCreateTabModalOpen(false)}
            >
              Tutup
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isSubmittingTab}>
              Buat Tab Sekarang
            </Button>
          </div>
        </form>
      </Modal>

      {/* Interactive Code Modal */}
      <Modal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        title="Contoh Integrasi API"
        description={`Kunci API untuk "${selectedSheetForCode?.spreadsheetName}" telah otomatis terpasang.`}
        maxWidth="lg"
      >
        <div className="flex flex-col gap-4">
          {/* Language selector */}
          <div className="flex flex-wrap gap-2 border-b-2 border-black pb-3">
            {(["curl", "fetch", "php", "python"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setCodeLang(lang)}
                className={`px-3 py-1 text-xs font-extrabold uppercase tracking-wider border-2 border-black ${
                  codeLang === lang ? "bg-[#ffe600] text-black shadow-[2px_2px_0px_#000000]" : "bg-white text-black"
                }`}
              >
                {lang === "fetch" ? "JavaScript" : lang === "php" ? "PHP" : lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Code block */}
          <div className="relative bg-black text-white p-4 font-mono text-xs overflow-x-auto border-2 border-black h-64">
            <button
              onClick={() => {
                const code =
                  codeLang === "curl"
                    ? `curl -X POST "https://lembar.atnan.my.id/api/v1/${selectedSheetForCode?.apiKey}/Sheet1" \\\n  -H "Content-Type: application/json" \\\n  -d '{"nama": "Budi", "status": "hadir"}'`
                    : codeLang === "fetch"
                    ? `const response = await fetch("https://lembar.atnan.my.id/api/v1/${selectedSheetForCode?.apiKey}/Sheet1", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ nama: "Budi", status: "hadir" }),\n});\nconst result = await response.json();`
                    : codeLang === "php"
                    ? `use Illuminate\\Support\\Facades\\Http;\n\n$response = Http::post("https://lembar.atnan.my.id/api/v1/${selectedSheetForCode?.apiKey}/Sheet1", [\n    "nama" => "Budi",\n    "status" => "hadir",\n]);\n$data = $response->json();`
                    : `import requests\n\npayload = {"nama": "Budi", "status": "hadir"}\nresponse = requests.post("https://lembar.atnan.my.id/api/v1/${selectedSheetForCode?.apiKey}/Sheet1", json=payload)\nprint(response.json())`;
                navigator.clipboard.writeText(code);
                alert("Kode berhasil disalin.");
              }}
              className="absolute top-3 right-3 px-2 py-1 text-[10px] font-extrabold uppercase bg-white text-black border-2 border-black hover:bg-[#ffe600]"
            >
              Salin Kode
            </button>
            <pre>
              {codeLang === "curl" &&
                `# Append 1 row
curl -X POST "https://lembar.atnan.my.id/api/v1/${selectedSheetForCode?.apiKey}/Sheet1" \\
  -H "Content-Type: application/json" \\
  -d '{"nama": "Budi", "status": "hadir"}'

# Read all rows
curl -X GET "https://lembar.atnan.my.id/api/v1/${selectedSheetForCode?.apiKey}/Sheet1"

# Auto-create tab & header
curl -X POST "https://lembar.atnan.my.id/api/v1/${selectedSheetForCode?.apiKey}/TabBaru/create" \\
  -H "Content-Type: application/json" \\
  -d '{"headers": ["nama", "email", "status"]}'`}

              {codeLang === "fetch" &&
                `// Append 1 row
const response = await fetch("https://lembar.atnan.my.id/api/v1/${selectedSheetForCode?.apiKey}/Sheet1", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nama: "Budi", status: "hadir" }),
});
const result = await response.json();
console.log(result);`}

              {codeLang === "php" &&
                `// Laravel Http Client
use Illuminate\\Support\\Facades\\Http;

$response = Http::post("https://lembar.atnan.my.id/api/v1/${selectedSheetForCode?.apiKey}/Sheet1", [
    "nama" => "Budi",
    "status" => "hadir",
]);
$data = $response->json();`}

              {codeLang === "python" &&
                `import requests

payload = {"nama": "Budi", "status": "hadir"}
response = requests.post("https://lembar.atnan.my.id/api/v1/${selectedSheetForCode?.apiKey}/Sheet1", json=payload)
data = response.json()
print(data)`}
            </pre>
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => setIsCodeModalOpen(false)}>
              Tutup
            </Button>
          </div>
        </div>
      </Modal>

      {/* Onboarding Segment Survey Modal (Required by spec) */}
      <Modal
        isOpen={showSurvey}
        onClose={() => setShowSurvey(false)}
        title="Selamat Datang di Lembar"
        description="Bantu kami memahami profil pemakaian Anda untuk pengembangan Closed Beta."
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs sm:text-sm font-bold text-black">
            Kamu berencana menggunakan Lembar untuk keperluan apa?
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => handleSubmitSurvey("developer")}
              className="p-3 border-2 border-black text-left hover:bg-[#ffe600] font-extrabold uppercase text-xs transition-all active:translate-x-[1px] active:translate-y-[1px]"
            >
              1. Proyek Pribadi / Freelance Developer
            </button>
            <button
              onClick={() => handleSubmitSurvey("organization")}
              className="p-3 border-2 border-black text-left hover:bg-[#ffe600] font-extrabold uppercase text-xs transition-all active:translate-x-[1px] active:translate-y-[1px]"
            >
              2. Organisasi / Komunitas (HIMATIF, UKM, Panitia Event)
            </button>
            <button
              onClick={() => handleSubmitSurvey("nocode")}
              className="p-3 border-2 border-black text-left hover:bg-[#ffe600] font-extrabold uppercase text-xs transition-all active:translate-x-[1px] active:translate-y-[1px]"
            >
              3. No-Code / Low-Code Project (Glide, Bubble, Webflow)
            </button>
            <button
              onClick={() => handleSubmitSurvey("other")}
              className="p-3 border-2 border-black text-left hover:bg-[#ffe600] font-extrabold uppercase text-xs transition-all active:translate-x-[1px] active:translate-y-[1px]"
            >
              4. Keperluan Lainnya
            </button>
          </div>
        </div>
      </Modal>

      {/* Upgrade to PRO Modal (Pakasir Payment Gateway) */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Upgrade ke Lembar PRO"
        description="Tingkatkan kapasitas request dan dapatkan fitur tanpa batas untuk proyek skala produksi."
        maxWidth="md"
      >
        <div className="flex flex-col gap-5">
          {/* Pricing Box */}
          <div className="p-4 bg-[#ffe600] border-2 border-black shadow-[3px_3px_0px_#000000]">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-black">
                Paket PRO Bulanan
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-black">Rp 49.000</span>
                <span className="text-xs font-bold text-black">/ bulan</span>
              </div>
            </div>
          </div>

          {/* Benefits List */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-black">
              Keuntungan Paket PRO:
            </span>
            <div className="flex flex-col gap-2 text-xs font-bold text-zinc-800">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-black stroke-[3]" />
                <span><strong>50.000 Request API / Bulan</strong> (dari 1.000 req)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-black stroke-[3]" />
                <span><strong>Multi-Spreadsheet</strong> Tanpa Batas</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-black stroke-[3]" />
                <span>Fitur <strong>Auto-Create Tab & Header</strong> Tanpa Batas</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-black stroke-[3]" />
                <span>Prioritas Kecepatan Server & Upstash Cache</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-black stroke-[3]" />
                <span>Aktivasi Otomatis Instan via <strong>QRIS Pakasir</strong></span>
              </div>
            </div>
          </div>

          {/* Payment CTA Buttons */}
          <div className="flex flex-col gap-3 pt-3 border-t-2 border-black">
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center text-sm shadow-[4px_4px_0px_#000000]"
              onClick={handleUpgradeCheckout}
              isLoading={isCheckingOut}
            >
              <CreditCard className="w-4 h-4 stroke-[2.5]" />
              <span>Bayar Rp 49.000 via QRIS</span>
            </Button>
            <p className="text-[10px] text-zinc-500 text-center font-bold uppercase tracking-wider flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-black" />
              <span>Didukung Pembayaran Resmi QRIS oleh Pakasir</span>
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
