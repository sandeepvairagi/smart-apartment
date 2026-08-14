/**
 * AI Chatbot Controller — Smart Assistant for Smart Apartment VMS
 * Features: Live database context resolution (Parcels, Visitors, Complaints, Notices)
 * and optional Gemini / OpenAI LLM integration.
 */
import Parcel from '../models/Parcel.js';
import Visitor from '../models/Visitor.js';
import Complaint from '../models/Complaint.js';
import Notice from '../models/Notice.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Handle chat query from user with role-aware context.
 */
export const handleChatQuery = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    res.status(400);
    throw new Error('Message content is required');
  }

  const queryText = message.trim().toLowerCase();
  const user = req.user || null;
  const role = user ? user.role : 'public';

  // 1. Try Live DB Smart Context Matching
  let dbContextReply = null;

  // A. PARCELS / COURIERS INTENT
  if (
    queryText.includes('parcel') ||
    queryText.includes('courier') ||
    queryText.includes('package') ||
    queryText.includes('delivery') ||
    queryText.includes('deliveries') ||
    queryText.includes('amazon') ||
    queryText.includes('flipkart')
  ) {
    if (role === 'resident') {
      const parcels = await Parcel.find({ resident: user._id })
        .sort({ createdAt: -1 })
        .limit(5);

      const pending = parcels.filter(
        (p) => p.status === 'received' || p.status === 'notified'
      );

      if (parcels.length === 0) {
        dbContextReply =
          `📦 **Courier Status**\n\nYou currently have no parcels logged at the security gate. ` +
          `When a delivery arrives, security guards will log it and notify you!`;
      } else if (pending.length > 0) {
        const itemLines = pending
          .map(
            (p) =>
              `• **${p.courier}** (${p.trackingId || 'No tracking ID'}) — Status: *${p.status.toUpperCase()}* (${p.description || 'Parcel'})`
          )
          .join('\n');

        dbContextReply =
          `📦 **Active Parcels Found! (${pending.length})**\n\n` +
          `${itemLines}\n\n` +
          `💡 *Tip: You can confirm pickup directly from your Parcels tab or show your unit number at the gate.*`;
      } else {
        const last = parcels[0];
        dbContextReply =
          `📦 **Courier Summary**\n\nYour last parcel (**${last.courier}**) was marked as *${last.status}* on ${new Date(last.updatedAt).toLocaleDateString()}.\n\n` +
          `No new uncollected parcels pending at the gate right now.`;
      }
    } else if (role === 'guard') {
      const totalPending = await Parcel.countDocuments({
        status: { $in: ['received', 'notified'] },
      });
      dbContextReply =
        `📦 **Guard Courier Desk Overview**\n\n` +
        `• Active uncollected parcels at gate: **${totalPending}**\n\n` +
        `To log a new incoming delivery, go to **Guard Console -> Parcels** and select the resident!`;
    } else {
      dbContextReply =
        `📦 **Courier & Delivery Support**\n\n` +
        `Residents receive instant email and in-app notifications whenever a courier (Amazon, Flipkart, FedEx, etc.) arrives at the security gate.`;
    }
  }

  // B. VISITORS / PASSES INTENT
  else if (
    queryText.includes('visitor') ||
    queryText.includes('guest') ||
    queryText.includes('pass') ||
    queryText.includes('invite') ||
    queryText.includes('entry') ||
    queryText.includes('qr')
  ) {
    if (role === 'resident') {
      const visitors = await Visitor.find({ resident: user._id })
        .sort({ createdAt: -1 })
        .limit(3);

      const active = visitors.filter((v) => v.status === 'checked-in');
      const pending = visitors.filter((v) => v.status === 'pending');

      dbContextReply =
        `👥 **Visitor Management Summary**\n\n` +
        `• Currently checked in at your flat: **${active.length}**\n` +
        `• Pending scheduled passes: **${pending.length}**\n\n` +
        `You can generate pre-approved QR entry passes for guests from your **Visitors** screen. Guests scan their pass at the security gate for seamless entry!`;
    } else if (role === 'guard') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const checkedInCount = await Visitor.countDocuments({ status: 'checked-in' });
      dbContextReply =
        `🛡️ **Guard Gate Operations**\n\n` +
        `• Currently inside complex: **${checkedInCount} visitors**\n\n` +
        `Use the **QR Scanner** tab to instantly verify visitor entry passes or log manual walk-in visitors.`;
    } else {
      dbContextReply =
        `👥 **Visitor Registration**\n\n` +
        `Visitors can register online at the **Public Visitor Portal** (` +
        `/visitor/register) or get a pre-approved QR pass sent by the resident.`;
    }
  }

  // C. COMPLAINTS / REPAIRS INTENT
  else if (
    queryText.includes('complaint') ||
    queryText.includes('repair') ||
    queryText.includes('issue') ||
    queryText.includes('plumb') ||
    queryText.includes('leak') ||
    queryText.includes('ticket')
  ) {
    if (role === 'resident') {
      const complaints = await Complaint.find({ resident: user._id })
        .sort({ createdAt: -1 })
        .limit(3);

      if (complaints.length === 0) {
        dbContextReply =
          `🛠️ **Maintenance & Complaints**\n\nYou have no open tickets. ` +
          `If you encounter any plumbing, electrical, or society issues, navigate to **Complaints** and click "Raise Complaint".`;
      } else {
        const lines = complaints
          .map(
            (c) =>
              `• **${c.title}** (${c.category}) — Status: **${c.status.toUpperCase()}**`
          )
          .join('\n');
        dbContextReply =
          `🛠️ **Your Complaints Status**\n\n${lines}\n\n` +
          `Society management updates ticket status in real-time as repairs progress.`;
      }
    } else {
      const openCount = await Complaint.countDocuments({
        status: { $in: ['pending', 'in-progress'] },
      });
      dbContextReply =
        `🛠️ **Society Helpdesk Overview**\n\nTotal open maintenance tickets in society: **${openCount}**.`;
    }
  }

  // D. NOTICES / ANNOUNCEMENTS INTENT
  else if (
    queryText.includes('notice') ||
    queryText.includes('announcement') ||
    queryText.includes('water') ||
    queryText.includes('power') ||
    queryText.includes('rule')
  ) {
    const latestNotices = await Notice.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(3);

    if (latestNotices.length > 0) {
      const noticeLines = latestNotices
        .map((n) => `📢 **${n.title}**\n${n.body}`)
        .join('\n\n');
      dbContextReply = `📢 **Latest Society Notices**\n\n${noticeLines}`;
    } else {
      dbContextReply =
        `📢 **Society Notices**\n\nThere are no active notices published today. Check back anytime!`;
    }
  }

  // E. EMERGENCY / CONTACTS INTENT
  else if (
    queryText.includes('emergency') ||
    queryText.includes('contact') ||
    queryText.includes('help') ||
    queryText.includes('phone') ||
    queryText.includes('security')
  ) {
    dbContextReply =
      `🚨 **Emergency Contacts & Assistance**\n\n` +
      `• Main Security Gate Desk: **+91 98765 43210**\n` +
      `• Maintenance Manager: **+91 98765 43211**\n` +
      `• Society Admin Office: **admin@smartapartment.com**\n` +
      `• Fire & Ambulance: **101 / 102**\n\n` +
      `For urgent gate entry assistance, notify the guard on duty immediately.`;
  }

  // F. GENERAL GREETINGS / FAQ FALLBACK
  else {
    const userName = user ? user.name : 'Resident/Guest';
    dbContextReply =
      `👋 Hello ${userName}! I am your **Smart Apartment AI Assistant**.\n\n` +
      `Here is what I can help you with:\n` +
      `• 📦 **Couriers & Parcels** — Check if you have packages waiting at the gate.\n` +
      `• 👥 **Visitors & Passes** — Check visitor check-in status or how to generate QR passes.\n` +
      `• 🛠️ **Maintenance & Complaints** — Track repair tickets or lodge new requests.\n` +
      `• 📢 **Notices & Guidelines** — Read official society announcements and gate policies.\n` +
      `• 🚨 **Emergency Contacts** — Get instant security gate and hotline numbers.\n\n` +
      `How can I assist you today?`;
  }

  res.status(200).json({
    success: true,
    data: {
      reply: dbContextReply,
      timestamp: new Date().toISOString(),
    },
  });
});
