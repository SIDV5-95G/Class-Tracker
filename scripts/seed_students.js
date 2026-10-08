// scripts/seed_students.js
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const fs = require('fs');

let supabaseUrl = 'https://xrqwdurntnvdqusfundv.supabase.co';
let supabaseKey = 'sb_publishable_9y3wOw1Qje3IpDxsyAItIA_5CmDgAW2';

try {
  if (fs.existsSync('.env.local')) {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    for (const line of envContent.split('\n')) {
      const [k, ...v] = line.split('=');
      if (k && v.length) {
        if (k.trim() === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = v.join('=').trim();
        if (k.trim() === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = v.join('=').trim();
      }
    }
  }
} catch (e) {}

const client = createClient(supabaseUrl, supabaseKey);

const studentsData = [
  // BATCH A (Roll 1 to 24, excluding 17)
  { roll: 1, name: 'Hadi Ansari', first: 'HADI', batch: 'Batch A', role: 'Student' },
  { roll: 2, name: 'Deven Bhadane', first: 'DEVEN', batch: 'Batch A', role: 'Student' },
  { roll: 3, name: 'Vaibhavi Bhamare', first: 'VAIBHAVI', batch: 'Batch A', role: 'Student' },
  { roll: 4, name: 'Aryan Bhumkar', first: 'ARYAN', batch: 'Batch A', role: 'Student' },
  { roll: 5, name: 'Kabir Chaudhary', first: 'KABIR', batch: 'Batch A', role: 'Student' },
  { roll: 6, name: 'Maitreyee Dahiwale', first: 'MAITREYEE', batch: 'Batch A', role: 'Student' },
  { roll: 7, name: 'Suraj Dalvi', first: 'SURAJ', batch: 'Batch A', role: 'Student' },
  { roll: 8, name: 'Harika Darbha', first: 'HARIKA', batch: 'Batch A', role: 'Student' },
  { roll: 9, name: 'Arnav Dhole', first: 'ARNAV', batch: 'Batch A', role: 'Student' },
  { roll: 10, name: 'Vedant Gaikwad', first: 'VEDANT', batch: 'Batch A', role: 'Student' },
  { roll: 11, name: 'Pratham Golhar', first: 'PRATHAM', batch: 'Batch A', role: 'Student' },
  { roll: 12, name: 'Chirag Guin', first: 'CHIRAG', batch: 'Batch A', role: 'Student' },
  { roll: 13, name: 'Nimai Gujja', first: 'NIMAI', batch: 'Batch A', role: 'Student' },
  { roll: 14, name: 'Siddharth Gupta', first: 'SIDDHARTH', batch: 'Batch A', role: 'Student' },
  { roll: 15, name: 'Vishal Gupta', first: 'VISHAL', batch: 'Batch A', role: 'Student' },
  { roll: 16, name: 'Devangi Gurav', first: 'DEVANGI', batch: 'Batch A', role: 'Student' },
  // Roll 17 is deleted
  { roll: 18, name: 'Vivek Jadhav', first: 'VIVEK', batch: 'Batch A', role: 'Student' },
  { roll: 19, name: 'Dhruv Kadam', first: 'DHRUV', batch: 'Batch A', role: 'Student' },
  { roll: 20, name: 'Ojas Kadam', first: 'OJAS', batch: 'Batch A', role: 'Student' },
  { roll: 21, name: 'Tanvi Kaginkar', first: 'TANVI', batch: 'Batch A', role: 'Student' },
  { roll: 22, name: 'Ankita Karmakar', first: 'ANKITA', batch: 'Batch A', role: 'Student' },
  { roll: 23, name: 'Chinmay Keskar', first: 'CHINMAY', batch: 'Batch A', role: 'Student' },
  { roll: 24, name: 'Siddhak Keswani', first: 'SIDDHAK', batch: 'Batch A', role: 'Student' },

  // BATCH B (Roll 25 to 48)
  { roll: 25, name: 'Yash Khuperkar', first: 'YASH', batch: 'Batch B', role: 'Student' },
  { roll: 26, name: 'Shravan Kotian', first: 'SHRAVAN', batch: 'Batch B', role: 'Student' },
  { roll: 27, name: 'Laqsh Koul', first: 'LAQSH', batch: 'Batch B', role: 'Student' },
  { roll: 28, name: 'Soham Kundargi', first: 'SOHAM', batch: 'Batch B', role: 'Student' },
  { roll: 29, name: 'Shraddha Lamane', first: 'SHRADDHA', batch: 'Batch B', role: 'Student' },
  { roll: 30, name: 'Sachin Mane', first: 'SACHIN', batch: 'Batch B', role: 'Student' },
  { roll: 31, name: 'Dhruv Manjrekar', first: 'DHRUV', batch: 'Batch B', role: 'Student' },
  { roll: 32, name: 'Sohali Dokuparthi', first: 'SOHALI', batch: 'Batch B', role: 'Student' },
  { roll: 33, name: 'Harikesh Menon', first: 'HARIKESH', batch: 'Batch B', role: 'Student' },
  { roll: 34, name: 'Diksha Mishra', first: 'DIKSHA', batch: 'Batch B', role: 'Student' },
  { roll: 35, name: 'Iteesha Modanwal', first: 'ITEESHA', batch: 'Batch B', role: 'Student' },
  { roll: 36, name: 'Taanaay Moharil', first: 'TAANAAY', batch: 'Batch B', role: 'Student' },
  { roll: 37, name: 'Soham Mukherjee', first: 'SOHAM', batch: 'Batch B', role: 'Student' },
  { roll: 38, name: 'Malishka Naik', first: 'MALISHKA', batch: 'Batch B', role: 'Student' },
  { roll: 39, name: 'Shruti Nair', first: 'SHRUTI', batch: 'Batch B', role: 'CR' }, // CR
  { roll: 40, name: 'Nandini A', first: 'NANDINI', batch: 'Batch B', role: 'Student' },
  { roll: 41, name: 'Manas Narkar', first: 'MANAS', batch: 'Batch B', role: 'Student' },
  { roll: 42, name: 'Parth Nemade', first: 'PARTH', batch: 'Batch B', role: 'Student' },
  { roll: 43, name: 'Jyotiraditya Nikam', first: 'JYOTIRADITYA', batch: 'Batch B', role: 'Student' },
  { roll: 44, name: 'Sheetal Panda', first: 'SHEETAL', batch: 'Batch B', role: 'Student' },
  { roll: 45, name: 'Krishna Pandey', first: 'KRISHNA', batch: 'Batch B', role: 'Student' },
  { roll: 46, name: 'Shubham Pansare', first: 'SHUBHAM', batch: 'Batch B', role: 'Student' },
  { roll: 47, name: 'Vedant Pathare', first: 'VEDANT', batch: 'Batch B', role: 'Student' },
  { roll: 48, name: 'Adway Patil', first: 'ADWAY', batch: 'Batch B', role: 'Student' },

  // BATCH C (Roll 49 to 71, excluding 68)
  { roll: 49, name: 'Hardik Patil', first: 'HARDIK', batch: 'Batch C', role: 'Student' },
  { roll: 50, name: 'Tanav Patil', first: 'TANAV', batch: 'Batch C', role: 'Student' },
  { roll: 51, name: 'Vedang Patil', first: 'VEDANG', batch: 'Batch C', role: 'CR' }, // CR
  { roll: 52, name: 'Aditi Patwa', first: 'ADITI', batch: 'Batch C', role: 'Student' },
  { roll: 53, name: 'Abhishek Potekar', first: 'ABHISHEK', batch: 'Batch C', role: 'Student' },
  { roll: 54, name: 'Rajveer Powar', first: 'RAJVEER', batch: 'Batch C', role: 'Student' },
  { roll: 55, name: 'Pragathi Balamurugan', first: 'PRAGATHI', batch: 'Batch C', role: 'Student' },
  { roll: 56, name: 'Shaila Ranjan', first: 'SHAILA', batch: 'Batch C', role: 'Student' },
  { roll: 57, name: 'Soham Sarang', first: 'SOHAM', batch: 'Batch C', role: 'Student' },
  { roll: 58, name: 'Kanishk Singh', first: 'KANISHK', batch: 'Batch C', role: 'Student' },
  { roll: 59, name: 'Palaksh Singh', first: 'PALAKSH', batch: 'Batch C', role: 'Student' },
  { roll: 60, name: 'Pranjal Singh', first: 'PRANJAL', batch: 'Batch C', role: 'Student' },
  { roll: 61, name: 'Shivansh Sinha', first: 'SHIVANSH', batch: 'Batch C', role: 'Student' },
  { roll: 62, name: 'Prakhar Srivastava', first: 'PRAKHAR', batch: 'Batch C', role: 'Student' },
  { roll: 63, name: 'Sumit Thite', first: 'SUMIT', batch: 'Batch C', role: 'Student' },
  { roll: 64, name: 'Prajkta Waghchaure', first: 'PRAJKTA', batch: 'Batch C', role: 'Student' },
  { roll: 65, name: 'Shlok Kesarkar', first: 'SHLOK', batch: 'Batch C', role: 'Student' },
  { roll: 66, name: 'Arya Ukirde', first: 'ARYA', batch: 'Batch C', role: 'Student' },
  { roll: 67, name: 'Jiya Patekar', first: 'JIYA', batch: 'Batch C', role: 'Student' },
  // Roll 68 is deleted
  { roll: 69, name: 'Neha Patil', first: 'NEHA', batch: 'Batch C', role: 'Student' },
  { roll: 70, name: 'Innayat Siddiqui', first: 'INNAYAT', batch: 'Batch C', role: 'Student' },
  { roll: 71, name: 'Vikarant Kharatmol', first: 'VIKARANT', batch: 'Batch C', role: 'Student' },
];

async function seed() {
  console.log(`Preparing to seed ${studentsData.length} students into Supabase profiles...`);

  const records = studentsData.map((s) => {
    const studentId = `${s.first}-D9B-${s.roll}`;
    return {
      id: crypto.randomUUID(),
      student_id: studentId,
      student_name: s.name,
      full_name: `${s.name} (D9B-${s.roll})`,
      class_name: 'D9B',
      roll_number: String(s.roll),
      password_hash: studentId, // password matches student ID
      role: s.role,
      batch: s.batch,
      created_at: new Date().toISOString(),
    };
  });

  // Insert in batches of 25
  for (let i = 0; i < records.length; i += 25) {
    const chunk = records.slice(i, i + 25);
    const { error } = await client.from('profiles').insert(chunk);
    if (error) {
      console.error(`Error inserting chunk ${Math.floor(i / 25) + 1}:`, error.message);
      process.exit(1);
    }
  }

  console.log('✓ Successfully inserted all 69 accounts into database!');
}

seed();
