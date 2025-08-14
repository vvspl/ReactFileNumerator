const express = require("express")
const cors = require("cors")
const multer = require("multer")
const fs = require("fs-extra")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static("uploads"))

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/temp"
    fs.ensureDirSync(uploadDir)
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const upload = multer({ storage })

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" })
})

// Upload files endpoint
app.post("/api/upload", upload.array("files"), (req, res) => {
  try {
    const files = req.files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.originalname,
      size: file.size,
      path: file.path,
      type: file.mimetype,
    }))

    res.json({ success: true, files })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Rename files endpoint
app.post("/api/rename", async (req, res) => {
  try {
    const { files, targetDirectory } = req.body

    // Ensure target directory exists
    await fs.ensureDir(targetDirectory)

    const results = []

    for (const file of files) {
      const oldPath = file.path
      const newPath = path.join(targetDirectory, file.newName)

      try {
        await fs.move(oldPath, newPath)
        results.push({
          success: true,
          oldName: file.name,
          newName: file.newName,
          newPath,
        })
      } catch (error) {
        results.push({
          success: false,
          oldName: file.name,
          error: error.message,
        })
      }
    }

    res.json({ success: true, results })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Clear temp files endpoint
app.delete("/api/clear", async (req, res) => {
  try {
    const tempDir = "uploads/temp"
    await fs.emptyDir(tempDir)
    res.json({ success: true, message: "Temp files cleared" })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
