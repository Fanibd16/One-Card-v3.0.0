// const multer = require('multer');
// const xlsx = require('xlsx');
// const Student = require('../models/studentModel');
// const express = require('express');
// const router = express.Router();
// const fs = require('fs');
// const { createCanvas, loadImage } = require('canvas');
// const QRCode = require('qrcode');
// const path = require('path');

// // Multer configuration for file upload
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, '../uploads'));
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage: storage });

// // Function to handle file upload and save data to MongoDB
// const uploadFile = async (req, res) => {
//   if (!req.file) {
//     return res.status(400).send('No file uploaded.');
//   }

//   const filePath = path.join(__dirname, '../uploads', req.file.filename);
//   const workbook = xlsx.readFile(filePath);
//   const sheet_name_list = workbook.SheetNames;
//   const xlData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

//   try {
//     for (let row of xlData) {
//       const existingStudent = await Student.findOne({ id: row.id });
      
//       if (existingStudent) {
//         existingStudent.name = row.name;
//         existingStudent.department = row.department;
//         existingStudent.contact = row.contact;
//         existingStudent.status = row.status;
//         existingStudent.photoPath = row.photoPath || '';
        
//         await existingStudent.save();
//       } else {
//         const newStudent = new Student({
//           name: row.name,
//           department: row.department,
//           contact: row.contact,
//           id: row.id,
//           status: row.status,
//           photoPath: row.photoPath || '',
//         });
//         await newStudent.save();
//       }
//     }
//     res.status(200).send('File uploaded and data saved to database successfully.');
//   } catch (error) {
//     console.error('Error saving student:', error);
//     res.status(500).send('An error occurred while saving the data.');
//   }
// };

// // Function to generate QR code and ID card for a student
// const generateIdCard = async (student) => {
//   try {
//     // Load the card template
//     const templatePath = path.join(__dirname, '../models/image/card.jpg');
//     const templateImage = await loadImage(templatePath);
    
//     const canvas = createCanvas(templateImage.width, templateImage.height);
//     const ctx = canvas.getContext('2d');

//     // Draw the card template
//     ctx.drawImage(templateImage, 0, 0);

//     // Draw student info
//     ctx.font = '20px Arial';
//     ctx.fillStyle = '#000';
//     ctx.fillText(`ID: ${student.id}`, 20, 50);
//     ctx.fillText(`Name: ${student.name}`, 20, 100);
//     ctx.fillText(`Dept: ${student.department}`, 20, 150);

//     // Generate QR code
//     const qrData = `KIOT-${student.id}`;
//     const qrImage = await QRCode.toDataURL(qrData);
//     const qr = await loadImage(qrImage);
//     ctx.drawImage(qr, 350, 50, 100, 100); // Position QR code

//     // Save the card image to the filesystem
//     const idCardPath = path.join(__dirname, `../cards/${student.id}-id-card.png`);
//     const out = fs.createWriteStream(idCardPath);
//     const stream = canvas.createPNGStream();
//     stream.pipe(out);
    
//     // Save QR code image
//     const qrCodePath = path.join(__dirname, `../cards/${student.id}-qr-code.png`);
//     await fs.promises.writeFile(qrCodePath, qrImage.split(",")[1], 'base64');

//     // Return card path after save
//     return new Promise((resolve, reject) => {
//       out.on('finish', async () => {
//         // Save the paths in the database
//         student.qr = qrCodePath; // Store QR code path
//         student.photoPath = idCardPath; // Store ID card path
//         await student.save(); // Save to the database
//         resolve(idCardPath);
//       });
//       out.on('error', reject);
//     });
//   } catch (error) {
//     console.error('Error generating ID card:', error);
//     throw error;
//   }
// };



// // Route to generate ID cards for all students
// router.get('/generate-id-cards', async (req, res) => {
//   try {
//     const students = await Student.find({ status: 'Approved' });
    
//     for (const student of students) {
//       const idCardPath = await generateIdCard(student);
//       student.qr = `KIOT-${student.id}`; // Store QR data
//       student.photoPath = idCardPath; // Store card path
//       await student.save();
//     }

//     res.status(200).send('ID cards generated successfully.');
//   } catch (error) {
//     console.error('Error generating ID cards:', error);
//     res.status(500).send('Failed to generate ID cards');
//   }
// });

// // Fetch all students
// router.get('/students', async (req, res) => {
//   try {
//     const students = await Student.find();
//     res.json(students);
//   } catch (error) {
//     console.error('Error fetching students:', error);
//     res.status(500).json({ error: 'Failed to fetch students' });
//   }
// });

// // Define the route for file upload
// router.post('/upload', upload.single('file'), uploadFile);

// module.exports = {
//   upload,
//   uploadFile,
//   generateIdCard,
//   getAllStudents: router.get.bind(router),
//   router
// };



const multer = require('multer');
const xlsx = require('xlsx');
const Student = require('../models/studentModel');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
// const QRCode = require('qrcode');
const path = require('path');
const JsBarcode = require('jsbarcode');
const Schedule = require('../models/scheduleModel'); 


const crypto = require('crypto');
// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Function to handle file upload and save data to MongoDB
const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const filePath = path.join(__dirname, '../uploads', req.file.filename);
  const workbook = xlsx.readFile(filePath);
  const sheet_name_list = workbook.SheetNames;
  const xlData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

  try {
    for (let row of xlData) {
      const existingStudent = await Student.findOne({ id: row.id });
      
      if (existingStudent) {
        existingStudent.name = row.name;
        existingStudent.department = row.department;
        existingStudent.contact = row.contact;
        existingStudent.status = row.status;
        existingStudent.photoPath = `photos/${row.photoPath}`;
        existingStudent.meal = row.meal;
        existingStudent.idCardPath = row.idCardPath || '';
        
        await existingStudent.save();
      } else {
        const newStudent = new Student({
          name: row.name,
          department: row.department,
          contact: row.contact,
          id: row.id,
          status: row.status,
          photoPath: `photos/${row.photoPath}`,
          meal: row.meal,
          idCardPath: row.idCardPath || ''
        });
        await newStudent.save();
      }
    }
    res.status(200).send('File uploaded and data saved to database successfully.');
  } catch (error) {
    console.error('Error saving student:', error);
    res.status(500).send('An error occurred while saving the data.');
  }
};


const hashData = (data, length = 8) => {
  // Create a SHA-256 hash and truncate it to the specified length
  const fullHash = crypto.createHash('sha256').update(data).digest('hex');
  return fullHash.slice(0, length); // Limit the length here
};

// Function to generate BAR code and ID card for a student
const generateIdCard = async (student) => {
  try {
    // Encrypt the student ID
    const encryptedId = hashData(student.id);

    // Load the card template
    const templatePath = path.join(__dirname, '../cards/card/card.jpg');
    const templateImage = await loadImage(templatePath);
    
    const canvas = createCanvas(templateImage.width, templateImage.height);
    const ctx = canvas.getContext('2d');

    // Draw the card template
    ctx.drawImage(templateImage, 0, 0);
    //get Expiry date
    const currentDate = new Date();
    const futureDate = new Date(currentDate.getFullYear() + 2, currentDate.getMonth(), currentDate.getDate());
    const day = futureDate.getDate();
    const month = futureDate.getMonth() + 1; // Months are 0-indexed, so add 1
    const year = futureDate.getFullYear();
    const expiryDate = `${day}/${month}/${year}`;
    // Draw student info
    ctx.font = '33px Consolas';
    ctx.fillStyle = '#000';
    ctx.fillText(`Name: ${student.name}`, 320, 200);
    ctx.fillText(`ID: WOUR/${student.id}`, 320, 250);
    ctx.fillText(`Dept: ${student.department}`, 320, 300);
    ctx.fillText(`Phone No.: ${student.contact}`, 320, 350);
    ctx.fillText(`Expiry date: ${expiryDate} `, 320, 400);
    
     // Draw student photo
    
     const studentPhoto = await loadImage(student.photoPath);
     ctx.drawImage(studentPhoto, 38, 169, 250, 335); // Position and resize as needed


  // Generate Barcode
const barcodeCanvas = createCanvas(100, 100); // Separate canvas for barcode
JsBarcode(barcodeCanvas, `KIOT-${encryptedId}`, {
  format: 'CODE128', // Barcode format  
  width: 2,          // Width of each bar
  height: 100,       // Height of the barcode
  displayValue: false // Hide text below the barcode
});

const barcode = await loadImage(barcodeCanvas.toDataURL());
ctx.drawImage(barcode, 305, 420, 730, 150);



// Sanitize filename and prepare save path
const sanitizeFileName = (fileName) => fileName.replace(/[/\\?%*:|"<>]/g, '_');
const sanitizedId = sanitizeFileName(student.id);
const idCardPath = path.join(__dirname, `../cards/${sanitizedId}-id-card.png`);
  
    const out = fs.createWriteStream(idCardPath);
    const stream = canvas.createPNGStream();
    

    // Ensure the stream pipes correctly
    stream.pipe(out);
    
    return new Promise((resolve, reject) => {
      out.on('finish', async () => {
        // Save paths in the database
        student.barCode = `KIOT-${encryptedId}`; // Store QR data as string
        student.idCardPath = idCardPath; // Store ID card path
        await student.save(); // Save to the database
        resolve(idCardPath);
      });
      out.on('error', (error) => {
        console.error('Error saving ID card:', error);
        reject(error);
      });
    });
  } catch (error) {
    console.error('Error generating ID card:', error);
    throw error;
  }
};

const cardsDirectory = path.join(__dirname, 'cards');
if (!fs.existsSync(cardsDirectory)) {
  fs.mkdirSync(cardsDirectory); // Create the directory if it doesn't exist
}


// Route to generate ID cards for all students
router.get('/generate-id-cards', async (req, res) => {
  try {
    const students = await Student.find({ status: 'approved' });
    console.log(`Found ${students.length} approved students.`);
    
    for (const student of students) {
      console.log(`Generating ID card for student ID: ${student.id}`);
      await generateIdCard(student);
    }

    res.status(200).send('ID cards generated successfully.');
  } catch (error) {
    console.error('Error generating ID cards:', error);
    res.status(500).send('Failed to generate ID cards');
  }
});

// Endpoint to check if a barcode exists in the database
router.post('/check-barcode', async (req, res) => {
  const { barCode } = req.body; // Change to 'barCode'
  const exists = await Student.findOne({ barCode: barCode }); // Check against 'barCode'
  res.json({ exists: !!exists });
});
// Fetch all students
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});


//add schedule
router.get('/schedules', async (req, res) => {
  try {
      const schedules = await Schedule.find(); // Fetch schedules from the database
      res.json(schedules); // Pass data to the EJS view
  }catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

router.post('/schedules', async (req, res) => {
  try {
    const { mealName, startTime, endTime, isFor, isExtended } = req.body;

    const newSchedule = new Schedule({
      mealName,
      startTime,
      endTime,
      isFor,
      isExtended: isExtended || false, // defaults to false if unchecked
    });

    await newSchedule.save();
    res.status(201).json({ message: 'Schedule created successfully', schedule: newSchedule });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Define the route for file upload
router.post('/upload', upload.single('file'), uploadFile);

module.exports = {
  upload,
  uploadFile,
  generateIdCard,
  getAllStudents: router.get.bind(router),
  router
};
