'use client';

import React, { useEffect, useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { Modal } from '@/components/Modal';
import { ImagePicker } from '@/components/ImagePicker';
import {
  Building2,
  Award,
  Cpu,
  Layers,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ExternalLink,
  Save,
  X,
  ShieldCheck,
  Search,
} from 'lucide-react';

export default function ClientsManagementPage() {
  const [activeTab, setActiveTab] = useState<'certifications' | 'industries' | 'expertise' | 'services'>('certifications');
  const [clientsData, setClientsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncAlert, setSyncAlert] = useState(false);

  // New industry tag input
  const [newIndustryTag, setNewIndustryTag] = useState('');

  // Modal for Certifications
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCertIndex, setEditingCertIndex] = useState<number | null>(null);
  const [certTag, setCertTag] = useState('');
  const [certTitle, setCertTitle] = useState('');
  const [certText, setCertText] = useState('');
  const [certImage, setCertImage] = useState('');
  const [certAccent, setCertAccent] = useState(false);

  useEffect(() => {
    fetchClientsData();
  }, []);

  const fetchClientsData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClientsData(data.clients || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Safe Array Extractors
  const industryTags: string[] = Array.isArray(clientsData?.industries)
    ? clientsData.industries
    : Array.isArray(clientsData?.industries?.tags)
      ? clientsData.industries.tags
      : [];

  const expertiseItems: any[] = Array.isArray(clientsData?.expertise)
    ? clientsData.expertise
    : Array.isArray(clientsData?.expertise?.items)
      ? clientsData.expertise.items
      : [];

  const certificationsList: any[] = Array.isArray(clientsData?.certifications)
    ? clientsData.certifications
    : [];

  const handleSaveAll = async (updatedData: any) => {
    try {
      setSaving(true);
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (data.success) {
        setClientsData(updatedData);
        setSyncAlert(true);
        setTimeout(() => setSyncAlert(false), 3000);
      }
    } catch (e) {
      alert('Failed to save clients data');
    } finally {
      setSaving(false);
    }
  };

  // Certifications CRUD
  const handleOpenAddCert = () => {
    setEditingCertIndex(null);
    setCertTag('Certification');
    setCertTitle('');
    setCertText('');
    setCertImage('/uploads/NEN-4400-1.png');
    setCertAccent(false);
    setCertModalOpen(true);
  };

  const handleOpenEditCert = (index: number) => {
    const cert = certificationsList[index];
    if (!cert) return;
    setEditingCertIndex(index);
    setCertTag(cert.tag || 'Certification');
    setCertTitle(cert.title || '');
    setCertText(cert.text || '');
    const imgVal = typeof cert.image === 'string' ? cert.image : cert.image?.src || '';
    setCertImage(imgVal || '');
    setCertAccent(!!cert.accent);
    setCertModalOpen(true);
  };

  const handleSaveCert = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedCerts = [...certificationsList];
    const existingCert = editingCertIndex !== null ? updatedCerts[editingCertIndex] : null;

    const newCert = {
      id: existingCert?.id || `cert-${Date.now()}`,
      tag: certTag,
      title: certTitle,
      text: certText,
      image: certImage,
      accent: certAccent,
      order: existingCert?.order || (updatedCerts.length + 1),
    };

    if (editingCertIndex !== null) {
      updatedCerts[editingCertIndex] = newCert;
    } else {
      updatedCerts.push(newCert);
    }

    const updatedData = { ...clientsData, certifications: updatedCerts };
    handleSaveAll(updatedData);
    setCertModalOpen(false);
  };

  const handleDeleteCert = (index: number) => {
    if (!confirm('Delete this certification card?')) return;
    const updatedCerts = certificationsList.filter((_: any, i: number) => i !== index);
    const updatedData = { ...clientsData, certifications: updatedCerts };
    handleSaveAll(updatedData);
  };

  // Industries Tag handlers
  const handleAddIndustry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIndustryTag.trim()) return;
    const currentTags = industryTags;
    if (currentTags.includes(newIndustryTag.trim())) return;
    const updatedTags = [...currentTags, newIndustryTag.trim()];

    let updatedIndustries: any;
    if (Array.isArray(clientsData?.industries)) {
      updatedIndustries = updatedTags;
    } else {
      updatedIndustries = { ...clientsData?.industries, tags: updatedTags };
    }

    handleSaveAll({ ...clientsData, industries: updatedIndustries });
    setNewIndustryTag('');
  };

  const handleDeleteIndustry = (tagToDelete: string) => {
    const currentTags = industryTags;
    const updatedTags = currentTags.filter((t: string) => t !== tagToDelete);

    let updatedIndustries: any;
    if (Array.isArray(clientsData?.industries)) {
      updatedIndustries = updatedTags;
    } else {
      updatedIndustries = { ...clientsData?.industries, tags: updatedTags };
    }

    handleSaveAll({ ...clientsData, industries: updatedIndustries });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Topbar
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Client Partners' },
        ]}
        searchPlaceholder="Search clients & accreditations..."
      />

      <div className="p-6 sm:p-8 lg:p-10 max-w-[1440px] mx-auto space-y-6">
        {/* Page Header (Editorial Serif) */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-serif text-[#111827] tracking-tight">
            Client Partners & Accreditations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage industry accreditations, sector capabilities, and client trust logos on macee.com.
          </p>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Partner Clients</p>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-bold text-[#111827] font-sans">
                  85+
                </span>
                <span className="text-xs font-semibold text-emerald-600">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Accreditations</p>
              <div className="mt-0.5">
                <span className="text-2xl sm:text-3xl font-bold text-[#111827] font-sans">
                  {certificationsList.length || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Sectors Supported</p>
              <div className="mt-0.5">
                <span className="text-2xl sm:text-3xl font-bold text-[#111827] font-sans">
                  {industryTags.length || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Compliance Standard</p>
              <div className="mt-0.5">
                <span className="text-2xl sm:text-3xl font-bold text-[#111827] font-sans">
                  SNA NEN
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center space-x-6 border-b border-slate-200 text-xs font-medium pt-2">
          {[
            { id: 'certifications', label: 'Accreditations & Certifications' },
            { id: 'industries', label: 'Industry Sectors' },
            { id: 'expertise', label: 'Technical Domains' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 transition-colors relative ${isActive
                  ? 'font-bold text-[#111827] border-b-2 border-[#E30613]'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {syncAlert && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fadeIn">
            <span>✓ Changes saved and synchronized with website files!</span>
          </div>
        )}

        {/* Tab 1: Certifications */}
        {activeTab === 'certifications' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-500">
                Official accreditations displayed on the Macee homepage and compliance sections.
              </p>
              <button
                onClick={handleOpenAddCert}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#E30613] hover:bg-[#b80510] text-white text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Certification</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {certificationsList.map((cert: any, idx: number) => {
                const imgSrc = typeof cert.image === 'string' ? cert.image : cert.image?.src;
                return (
                  <div
                    key={idx}
                    className={`bg-white rounded-2xl p-6 border shadow-2xs transition-all relative flex flex-col justify-between ${cert.accent ? 'border-[#E30613]/50 ring-1 ring-[#E30613]/20' : 'border-slate-100'
                      }`}
                  >
                    <div>
                      {/* Top Header: Tag, Logo & Actions */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          {imgSrc ? (
                            <div className="h-12 w-20 bg-slate-50 border border-slate-200/80 rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                              <img
                                src={imgSrc}
                                alt={cert.title}
                                className="max-h-full max-w-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = '/uploads/favicon-96x96.png';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="h-12 w-12 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 text-slate-400">
                              <Award className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#F0F3FA] text-[#36427D] truncate">
                            {cert.tag || 'Accreditation'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleOpenEditCert(idx)}
                            className="text-slate-500 hover:text-[#111827] text-xs font-semibold px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCert(idx)}
                            className="text-rose-500 hover:text-rose-700 text-xs font-semibold px-2 py-1 rounded-md hover:bg-rose-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-[#111827] mt-3.5 font-sans">
                        {cert.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {cert.text}
                      </p>
                    </div>

                    {imgSrc && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="truncate max-w-[260px] font-mono text-[10px] text-slate-500">{imgSrc}</span>
                        <span className="text-emerald-600 font-semibold text-[10px]">✓ Logo Attached</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Industry Sectors */}
        {activeTab === 'industries' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-[#111827] font-sans">
                Industry Sectors & Capable Fields
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                These tags dictate the filter options on the Contact and Solution pages.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {industryTags.map((tag: string, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#F0F3FA] text-slate-800 text-xs font-semibold border border-slate-200/60"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleDeleteIndustry(tag)}
                    className="text-slate-400 hover:text-[#E30613] p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <form onSubmit={handleAddIndustry} className="flex gap-2 max-w-md pt-2">
              <input
                type="text"
                placeholder="New industry sector (e.g. Maritime & Offshore)..."
                value={newIndustryTag}
                onChange={(e) => setNewIndustryTag(e.target.value)}
                className="flex-1 p-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
              />
              <button type="submit" className="is-btn py-2 px-4 text-xs font-semibold">
                Add Tag
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Technical Domains */}
        {activeTab === 'expertise' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-6 space-y-4">
            <h3 className="text-base font-bold text-[#111827] font-sans">
              Domain Competencies & Roles
            </h3>
            <p className="text-xs text-slate-500">
              Specialized candidate allocation frameworks.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {expertiseItems.map((item: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                    {item.domain}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {Array.isArray(item.technologies) ? item.technologies.join(', ') : item.technologies}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Certification Modal */}
      {certModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setCertModalOpen(false)}
          title={editingCertIndex !== null ? 'Edit Certification' : 'Add Certification'}
          subtitle="Updates will sync with Macee's accreditation banners."
          maxWidth="lg"
        >
          <form onSubmit={handleSaveCert} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Badge Tag</label>
              <input
                type="text"
                required
                value={certTag}
                onChange={(e) => setCertTag(e.target.value)}
                placeholder="e.g. SNA NEN 4400-1 Certified"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                required
                value={certTitle}
                onChange={(e) => setCertTitle(e.target.value)}
                placeholder="e.g. Verified Compliance"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
              <textarea
                required
                rows={3}
                value={certText}
                onChange={(e) => setCertText(e.target.value)}
                placeholder="Details of certification and legal standing..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
              />
            </div>

            <div>
              <ImagePicker
                value={certImage}
                onChange={(newUrl) => setCertImage(newUrl)}
                label="Accreditation Logo / Badge Image"
                helperText="Upload official certificate badge (PNG/JPG) or enter image URL."
                previewShape="rounded"
                aspect="wide"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="certAccent"
                checked={certAccent}
                onChange={(e) => setCertAccent(e.target.checked)}
                className="rounded border-slate-300 text-[#E30613] focus:ring-0"
              />
              <label htmlFor="certAccent" className="text-xs text-slate-700 font-medium">
                Highlight with Brand Red Border (Featured)
              </label>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setCertModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className="is-btn py-2 px-5 text-xs font-semibold">
                {saving ? 'Saving...' : 'Save Certification'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
