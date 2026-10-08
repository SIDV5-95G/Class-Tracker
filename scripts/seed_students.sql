-- ==============================================================================
-- SEED 69 STUDENTS AND CRS FOR CLASS TRACKER (D9B)
-- Roll 17 and Roll 68 are excluded
-- Roll 39 (SHRUTI NAIR) and Roll 51 (VEDANG PATIL) are CR
-- Username and Password are set to <FIRSTNAME>-D9B-<ROLLNO>
-- ==============================================================================

INSERT INTO public.profiles (id, student_id, student_name, full_name, class_name, roll_number, password_hash, role, batch, created_at)
VALUES
  -- BATCH A (Roll 1 to 24, excluding 17)
  (gen_random_uuid(), 'HADI-D9B-1', 'Hadi Ansari', 'Hadi Ansari (D9B-1)', 'D9B', '1', 'HADI-D9B-1', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'DEVEN-D9B-2', 'Deven Bhadane', 'Deven Bhadane (D9B-2)', 'D9B', '2', 'DEVEN-D9B-2', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'VAIBHAVI-D9B-3', 'Vaibhavi Bhamare', 'Vaibhavi Bhamare (D9B-3)', 'D9B', '3', 'VAIBHAVI-D9B-3', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'ARYAN-D9B-4', 'Aryan Bhumkar', 'Aryan Bhumkar (D9B-4)', 'D9B', '4', 'ARYAN-D9B-4', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'KABIR-D9B-5', 'Kabir Chaudhary', 'Kabir Chaudhary (D9B-5)', 'D9B', '5', 'KABIR-D9B-5', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'MAITREYEE-D9B-6', 'Maitreyee Dahiwale', 'Maitreyee Dahiwale (D9B-6)', 'D9B', '6', 'MAITREYEE-D9B-6', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'SURAJ-D9B-7', 'Suraj Dalvi', 'Suraj Dalvi (D9B-7)', 'D9B', '7', 'SURAJ-D9B-7', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'HARIKA-D9B-8', 'Harika Darbha', 'Harika Darbha (D9B-8)', 'D9B', '8', 'HARIKA-D9B-8', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'ARNAV-D9B-9', 'Arnav Dhole', 'Arnav Dhole (D9B-9)', 'D9B', '9', 'ARNAV-D9B-9', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'VEDANT-D9B-10', 'Vedant Gaikwad', 'Vedant Gaikwad (D9B-10)', 'D9B', '10', 'VEDANT-D9B-10', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'PRATHAM-D9B-11', 'Pratham Golhar', 'Pratham Golhar (D9B-11)', 'D9B', '11', 'PRATHAM-D9B-11', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'CHIRAG-D9B-12', 'Chirag Guin', 'Chirag Guin (D9B-12)', 'D9B', '12', 'CHIRAG-D9B-12', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'NIMAI-D9B-13', 'Nimai Gujja', 'Nimai Gujja (D9B-13)', 'D9B', '13', 'NIMAI-D9B-13', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'SIDDHARTH-D9B-14', 'Siddharth Gupta', 'Siddharth Gupta (D9B-14)', 'D9B', '14', 'SIDDHARTH-D9B-14', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'VISHAL-D9B-15', 'Vishal Gupta', 'Vishal Gupta (D9B-15)', 'D9B', '15', 'VISHAL-D9B-15', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'DEVANGI-D9B-16', 'Devangi Gurav', 'Devangi Gurav (D9B-16)', 'D9B', '16', 'DEVANGI-D9B-16', 'Student', 'Batch A', NOW()),
  -- Roll 17 is deleted
  (gen_random_uuid(), 'VIVEK-D9B-18', 'Vivek Jadhav', 'Vivek Jadhav (D9B-18)', 'D9B', '18', 'VIVEK-D9B-18', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'DHRUV-D9B-19', 'Dhruv Kadam', 'Dhruv Kadam (D9B-19)', 'D9B', '19', 'DHRUV-D9B-19', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'OJAS-D9B-20', 'Ojas Kadam', 'Ojas Kadam (D9B-20)', 'D9B', '20', 'OJAS-D9B-20', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'TANVI-D9B-21', 'Tanvi Kaginkar', 'Tanvi Kaginkar (D9B-21)', 'D9B', '21', 'TANVI-D9B-21', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'ANKITA-D9B-22', 'Ankita Karmakar', 'Ankita Karmakar (D9B-22)', 'D9B', '22', 'ANKITA-D9B-22', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'CHINMAY-D9B-23', 'Chinmay Keskar', 'Chinmay Keskar (D9B-23)', 'D9B', '23', 'CHINMAY-D9B-23', 'Student', 'Batch A', NOW()),
  (gen_random_uuid(), 'SIDDHAK-D9B-24', 'Siddhak Keswani', 'Siddhak Keswani (D9B-24)', 'D9B', '24', 'SIDDHAK-D9B-24', 'Student', 'Batch A', NOW()),

  -- BATCH B (Roll 25 to 48)
  (gen_random_uuid(), 'YASH-D9B-25', 'Yash Khuperkar', 'Yash Khuperkar (D9B-25)', 'D9B', '25', 'YASH-D9B-25', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'SHRAVAN-D9B-26', 'Shravan Kotian', 'Shravan Kotian (D9B-26)', 'D9B', '26', 'SHRAVAN-D9B-26', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'LAQSH-D9B-27', 'Laqsh Koul', 'Laqsh Koul (D9B-27)', 'D9B', '27', 'LAQSH-D9B-27', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'SOHAM-D9B-28', 'Soham Kundargi', 'Soham Kundargi (D9B-28)', 'D9B', '28', 'SOHAM-D9B-28', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'SHRADDHA-D9B-29', 'Shraddha Lamane', 'Shraddha Lamane (D9B-29)', 'D9B', '29', 'SHRADDHA-D9B-29', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'SACHIN-D9B-30', 'Sachin Mane', 'Sachin Mane (D9B-30)', 'D9B', '30', 'SACHIN-D9B-30', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'DHRUV-D9B-31', 'Dhruv Manjrekar', 'Dhruv Manjrekar (D9B-31)', 'D9B', '31', 'DHRUV-D9B-31', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'SOHALI-D9B-32', 'Sohali Dokuparthi', 'Sohali Dokuparthi (D9B-32)', 'D9B', '32', 'SOHALI-D9B-32', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'HARIKESH-D9B-33', 'Harikesh Menon', 'Harikesh Menon (D9B-33)', 'D9B', '33', 'HARIKESH-D9B-33', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'DIKSHA-D9B-34', 'Diksha Mishra', 'Diksha Mishra (D9B-34)', 'D9B', '34', 'DIKSHA-D9B-34', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'ITEESHA-D9B-35', 'Iteesha Modanwal', 'Iteesha Modanwal (D9B-35)', 'D9B', '35', 'ITEESHA-D9B-35', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'TAANAAY-D9B-36', 'Taanaay Moharil', 'Taanaay Moharil (D9B-36)', 'D9B', '36', 'TAANAAY-D9B-36', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'SOHAM-D9B-37', 'Soham Mukherjee', 'Soham Mukherjee (D9B-37)', 'D9B', '37', 'SOHAM-D9B-37', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'MALISHKA-D9B-38', 'Malishka Naik', 'Malishka Naik (D9B-38)', 'D9B', '38', 'MALISHKA-D9B-38', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'SHRUTI-D9B-39', 'Shruti Nair', 'Shruti Nair (D9B-39)', 'D9B', '39', 'SHRUTI-D9B-39', 'CR', 'Batch B', NOW()),
  (gen_random_uuid(), 'NANDINI-D9B-40', 'Nandini A', 'Nandini A (D9B-40)', 'D9B', '40', 'NANDINI-D9B-40', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'MANAS-D9B-41', 'Manas Narkar', 'Manas Narkar (D9B-41)', 'D9B', '41', 'MANAS-D9B-41', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'PARTH-D9B-42', 'Parth Nemade', 'Parth Nemade (D9B-42)', 'D9B', '42', 'PARTH-D9B-42', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'JYOTIRADITYA-D9B-43', 'Jyotiraditya Nikam', 'Jyotiraditya Nikam (D9B-43)', 'D9B', '43', 'JYOTIRADITYA-D9B-43', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'SHEETAL-D9B-44', 'Sheetal Panda', 'Sheetal Panda (D9B-44)', 'D9B', '44', 'SHEETAL-D9B-44', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'KRISHNA-D9B-45', 'Krishna Pandey', 'Krishna Pandey (D9B-45)', 'D9B', '45', 'KRISHNA-D9B-45', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'SHUBHAM-D9B-46', 'Shubham Pansare', 'Shubham Pansare (D9B-46)', 'D9B', '46', 'SHUBHAM-D9B-46', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'VEDANT-D9B-47', 'Vedant Pathare', 'Vedant Pathare (D9B-47)', 'D9B', '47', 'VEDANT-D9B-47', 'Student', 'Batch B', NOW()),
  (gen_random_uuid(), 'ADWAY-D9B-48', 'Adway Patil', 'Adway Patil (D9B-48)', 'D9B', '48', 'ADWAY-D9B-48', 'Student', 'Batch B', NOW()),

  -- BATCH C (Roll 49 to 71, excluding 68)
  (gen_random_uuid(), 'HARDIK-D9B-49', 'Hardik Patil', 'Hardik Patil (D9B-49)', 'D9B', '49', 'HARDIK-D9B-49', 'Student', 'Batch C', NOW()),
  (gen_random_uuid(), 'TANAV-D9B-50', 'Tanav Patil', 'Tanav Patil (D9B-50)', 'D9B', '50', 'TANAV-D9B-50', 'Student', 'Batch C', NOW()),
  (gen_random_uuid(), 'VEDANG-D9B-51', 'Vedang Patil', 'Vedang Patil (D9B-51)', 'D9B', '51', 'VEDANG-D9B-51', 'CR', 'Batch C', NOW()),
  (gen_random_uuid(), 'ADITI-D9B-52', 'Aditi Patwa', 'Aditi Patwa (D9B-52)', 'D9B', '52', 'ADITI-D9B-52', 'Student', 'Batch C', NOW()),
  (gen_random_uuid(), 'ABHISHEK-D9B-53', 'Abhishek Potekar', 'Abhishek Potekar (D9B-53)', 'D9B', '53', 'ABHISHEK-D9B-53', 'Student', 'Batch C', NOW()),
  (gen_random_uuid(), 'RAJVEER-D9B-54', 'Rajveer Powar', 'Rajveer Powar (D9B-54)', 'D9B', '54', 'RAJVEER-D9B-54', 'Student', 'Batch C', NOW()),
  (gen_random_uuid(), 'PRAGATHI-D9B-55', 'Pragathi Balamurugan', 'Pragathi Balamurugan (D9B-55)', 'D9B', '55', 'PRAGATHI-D9B-55', 'Student', 'Batch C', NOW()),
  (gen_random_uuid(), 'SHAILA-D9B-56', 'Shaila Ranjan', 'Shaila Ranjan (D9B-56)', 'D9B', '56', 'SHAILA-D9B-56', 'Student', 'Batch C', NOW()),
  (gen_random_uuid(), 'SOHAM-D9B-57', 'Soham Sarang', 'Soham Sarang (D9B-57)', 'D9B', '57', 'SOHAM-D9B-57', 'Student', 'Batch C', NOW()),
  (gen_random_uuid(), 'KANISHK-D9B-58', 'Kanishk Singh', 'Kanishk Singh (D9B-58)', 'D9B', '58', 'KANISHK-D9B-58', 'Student', 'Batch C', NOW()),
  (gen_random_uuid(), 'PALAKSH-D9B-59', 'Palaksh Singh', 'Palaksh Singh (D9B-59)', 'D9B', '59', 'PALAKSH-D9B-59', 'Student', 'Batch C', NOW()),
  (gen_random_uuid(), 'PRANJAL-D9B-60', 'Pranjal Singh', 'Pranjal Singh (D9B-60)', 'D9B', '60', 'PRANJAL-D9B-60', 'Student', 'Batch C', NOW()),
  (gen_random_uuid(), 'SHIVANSH-D9B-61', 'Shivansh Sinha', 'Shivansh Sinha (D9B-61)', 'D9B', '61', 'SHIVANSH-D9B-61', 'Student', 'Batch C', NOW()),
  (gen_random_uuid(), 'PRAKHAR-D9B-62', 'Prakhar Srivastava', 'Prakhar Srivastava (D9B-62)', 'D9B', '62', 'PRAKHAR-D9B-62', 'Student', 'Batch C', NOW()),
  (gen_random_uuid(), 'SUMIT-D9B-63', 'Sumit Thite', 'Sumit Thite (D9B-63)', 'D9B', '63', 'SUMIT-D9B-63', 'Student', 'Batch C', NOW()),
  (gen_random_uuid(), 'PRAJKTA-D9B-64', 'Prajkta Waghchaure', 'Prajkta Waghchaure (D9B-64)', 'D9B', '64', 'PRAJKTA-D9B-64', 'Student', 'Batch C', NOW()),
  (gen_random_uuid(), 'SHLOK-D9B-65', 'Shlok Kesarkar', 'Shlok Kesarkar (D9B-65)', 'D9B', '65', 'SHLOK-D9B-65', 'Student', 'Batch C', NOW()),
  (gen_random_uuid(), 'ARYA-D9B-66', 'Arya Ukirde', 'Arya Ukirde (D9B-66)', 'D9B', '66', 'ARYA-D9B-66', 'Student', 'Batch C', NOW()),
  (gen_random_uuid(), 'JIYA-D9B-67', 'Jiya Patekar', 'Jiya Patekar (D9B-67)', 'D9B', '67', 'JIYA-D9B-67', 'Student', 'Batch C', NOW()),
  -- Roll 68 is deleted
  (gen_random_uuid(), 'NEHA-D9B-69', 'Neha Patil', 'Neha Patil (D9B-69)', 'D9B', '69', 'NEHA-D9B-69', 'Student', 'Batch C', NOW()),
  (gen_random_uuid(), 'INNAYAT-D9B-70', 'Innayat Siddiqui', 'Innayat Siddiqui (D9B-70)', 'D9B', '70', 'INNAYAT-D9B-70', 'Student', 'Batch C', NOW()),
  (gen_random_uuid(), 'VIKARANT-D9B-71', 'Vikarant Kharatmol', 'Vikarant Kharatmol (D9B-71)', 'D9B', '71', 'VIKARANT-D9B-71', 'Student', 'Batch C', NOW());
