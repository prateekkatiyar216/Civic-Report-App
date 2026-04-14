import { Response, Router } from "express";
import { upload } from "../config/cloudinary";
import { adminOnly, AuthRequest, protect } from "../middleware/auth";
import Issue from "../models/Issue";

const router = Router();

// ── POST /api/issues/report ───────────────────────────────
router.post("/report", protect, upload.single("image"), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, latitude, longitude } = req.body;

    if (!title || !description || !category || !latitude || !longitude) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image is required." });
    }

    const imageUrl = (req.file as any).path;

    const issue = await Issue.create({
      title,
      description,
      category,
      imageUrl,
      latitude:  parseFloat(latitude),
      longitude: parseFloat(longitude),
      userId:    req.userId,
      userName:  req.userName,
      status:    "pending",
    });

    res.status(201).json({ message: "Issue reported successfully.", issue });
  } catch (err: any) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// ── GET /api/issues ───────────────────────────────────────
router.get("/", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { category, status } = req.query;
    const filter: any = {};

    if (category && category !== "all") filter.category = category;
    if (status) filter.status = status;

    const issues = await Issue.find(filter).sort({ createdAt: -1 });
    res.json({ issues, total: issues.length });
  } catch (err: any) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// ── GET /api/issues/:id ───────────────────────────────────
router.get("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found." });
    res.json({ issue });
  } catch (err: any) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// ── PATCH /api/issues/:id/status (admin only) ─────────────
router.patch("/:id/status", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "in_progress", "resolved"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!issue) return res.status(404).json({ message: "Issue not found." });
    res.json({ message: "Status updated.", issue });
  } catch (err: any) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// ── DELETE /api/issues/:id ────────────────────────────────
router.delete("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found." });

    if (issue.userId.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Not authorized." });
    }

    await issue.deleteOne();
    res.json({ message: "Issue deleted." });
  } catch (err: any) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

export default router;