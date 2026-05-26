import { assignAttachmentService, getAllAttachmentsService, getAttachmentByIdService, getMyAttachmentService, endAttachmentService, } from "./attachments.service.js";
// POST /api/attachments  (admin)
export const assignAttachment = async (req, res) => {
    try {
        await assignAttachmentService(req.user.userId, req.body);
        res.status(201).json({ success: true, message: "Supervisor assigned successfully" });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};
// GET /api/attachments  (admin / supervisor)
export const getAllAttachments = async (req, res) => {
    try {
        const result = await getAllAttachmentsService(req.query.page, req.query.limit, req.user.role === "supervisor" ? req.user.userId : undefined);
        res.json({ success: true, message: "Attachments retrieved.", ...result });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};
// GET /api/attachments/me  (student)
export const getMyAttachment = async (req, res) => {
    try {
        const data = await getMyAttachmentService(req.user.studentId);
        res.json({ success: true, message: "Your attachment retrieved.", data });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};
// GET /api/attachments/:id  (admin / supervisor)
export const getAttachmentById = async (req, res) => {
    try {
        const id = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
        const data = await getAttachmentByIdService(id, req.user.role === "supervisor" ? req.user.userId : undefined);
        res.json({ success: true, message: "Attachment retrieved.", data });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};
// PATCH /api/attachments/:id/end  (admin)
export const endAttachment = async (req, res) => {
    try {
        const data = await endAttachmentService(typeof req.params.id === "string" ? req.params.id : req.params.id[0]);
        res.json({ success: true, message: "Attachment marked as completed.", data });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};
