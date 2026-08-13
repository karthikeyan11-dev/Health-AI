Health AI — Final Admin Dashboard Structure
1. 🏠 Admin Dashboard / Overview

This is the main landing page after an ADMIN logs in.

KPI cards

Display:

Total Users
Total Patients
Active Patients
Connected Devices
Patients Currently Monitoring
Critical/Abnormal Alerts
Assessments Completed
Reports Generated
Charts

1. Patient Activity Trend — Line Chart

Shows:

Daily/weekly active patients
Patient monitoring activity over time

2. Health Monitoring Overview — Area/Line Chart

Shows aggregated:

Heart rate
SpO₂
Temperature

over time.

3. Assessment Distribution — Donut Chart

Categories:

Cardiovascular assessments
Stress assessments

4. Patient Risk Distribution — Donut Chart

Categories:

Low
Moderate
High
Critical
Additional section

Recent Activity table

Examples:

New user registered
Patient assessment completed
Device connected
Abnormal reading detected
Report generated
2. 👥 Users Management

Admin manages the application's user accounts.

Display

Table:

Name
Email
Role
Account status
Registration date
Last activity
Actions
View user
Activate/deactivate user
View associated patient
View activity
KPI cards
Total users
Active users
Inactive users
New users
Charts

User Registration Trend — Line Chart

Users registered per day/week/month.

User Role Distribution — Donut Chart

Patient
Clinician
Admin
System
3. 🧑‍⚕️ Patients

This is separate from Users because your system already has a Patient model.

KPI cards
Total patients
Active patients
Patients under monitoring
Patients with abnormal readings
Patient table
Patient name
Age
Gender
Assigned clinician
Device status
Current health status
Last reading
Last assessment
Actions
View patient
View health history
View assessments
View digital twin
View reports
Charts

Patient Demographics — Bar/Donut Chart

Age groups
Gender distribution

Patient Status — Donut Chart

Normal
Monitoring
Attention required
Critical
4. 📡 Devices & IoT Monitoring

This page manages the hardware connected to patients.

Your current project scope includes the physiological sensor readings, particularly:

Heart Rate
SpO₂
Temperature
KPI cards
Total devices
Connected devices
Offline devices
Devices with recent readings
Device table
Device ID
Patient
Device status
Last connected
Last reading
Battery/status if actually available from hardware

Do NOT display battery if your hardware does not provide it.

Charts

Device Connectivity — Donut Chart

Online
Offline

Readings Received — Line Chart

Number of sensor readings received over time.

Device Activity — Bar Chart

Readings per device.

5. ❤️ Health Monitoring

This is one of the most important pages.

Current monitoring metrics

For selected patient:

Heart Rate — BPM
SpO₂ — %
Temperature — °C
Main visualization

Vital Signs Trend — Multi-line Chart

X-axis:

Time

Y-axis:

Vital measurement

Separate lines for:

Heart Rate
SpO₂
Temperature
Additional charts

Heart Rate Trend — Line Chart

SpO₂ Trend — Line Chart

Temperature Trend — Line Chart

Abnormal readings

Table:

Time	Vital	Value	Status
...	Heart Rate	...	Abnormal

This page should allow the Admin/Clinician to select a patient and inspect their historical readings.

6. 🧠 AI & Health Assessments

I recommend keeping the two assessment types under one Admin section rather than creating unnecessary separate top-level pages.

6.1 Cardiovascular Risk
KPI cards
Assessments completed
Low risk
Moderate risk
High risk
Critical risk
Charts

Risk Distribution — Donut Chart

Low
Moderate
High
Critical

Risk Trend — Line Chart

Risk assessment results over time.

Risk Factors — Bar Chart

Based only on the factors actually available in your assessment implementation.

Assessment table
Patient
Assessment date
Risk level
Assessment status
View details
6.2 Stress Assessment
KPI cards
Total assessments
Low stress
Moderate stress
High stress
Charts

Stress Level Distribution — Donut Chart

Stress Trend — Line Chart

Stress Score Distribution — Bar Chart

Assessment table
Patient
Date
Stress level
Score
Status
7. 🤖 Emotion AI & Digital Twin

This page represents the AI-specific part of the platform.

Remember: the existing Python emotion system is being integrated as a separate AI microservice, not merged into the Node.js backend.

Emotion section

Display:

Current detected emotion
Emotion history
Emotion distribution
Number of emotion analyses
Chart

Emotion Distribution — Donut/Bar Chart

Possible existing model classes:

Happy
Sad
Neutral
Angry
Fear
Surprise
Disgust
Emotion Trend

Line/Area Chart

Emotion observations over time.

Digital Twin section

For a selected patient:

Display a simplified digital representation of:

Current physiological state
Recent vital readings
Cardiovascular risk
Stress status
Emotional state
Digital Twin Timeline

Line/Area Chart

Shows changes in the patient's health state over time.

Keep the Digital Twin visualization as a health-state representation, not a complicated 3D simulation. Your current project does not require a full 3D digital human.

8. 💬 AI Chat & Recommendations

This page allows Admin/Clinician to inspect AI-assisted interactions and recommendations.

Chat metrics
Total chat sessions
Active sessions
Total messages
Sessions per day
Chart

Chat Activity — Line Chart

Messages/sessions over time.

Chat sessions table
Patient
Session
Started at
Last activity
Message count
Recommendations

Display:

Patient
Recommendation type
Generated date
Status
Chart

Recommendation Distribution — Bar Chart

Grouped by the recommendation categories actually implemented by your backend.

Don't invent recommendation categories until they exist in the backend.

9. 📄 Reports

Admin can view the reports generated by the system.

KPI cards
Total reports
Reports generated this month
Patient reports
Assessment reports
Reports table
Report ID
Patient
Report type
Generated date
Generated by
Status
Actions
Chart

Reports Generated — Line Chart

Reports generated over time.

Actions
View
Download PDF
View patient

Your existing PDF/QR report concept fits here.

Final Sidebar

So I recommend the Admin sidebar being exactly this:

Admin
│
├── Dashboard
│
├── Users
│
├── Patients
│
├── Devices
│
├── Health Monitoring
│
├── AI & Assessments
│   ├── Cardiovascular Risk
│   └── Stress Assessment
│
├── Emotion AI & Digital Twin
│
├── Chat & Recommendations
│
└── Reports
Final visualization choices
Requirement	Visualization
KPI/summary	Metric Cards
Time-based data	Line Chart
Multiple vital trends	Multi-Line Chart
Continuous health trend	Area Chart
Category comparison	Bar Chart
Ranking	Horizontal Bar Chart
Part-to-whole	Donut Chart
Risk distribution	Donut Chart
Device status	Donut Chart
Patient demographics	Bar/Donut Chart
Sensor history	Line Chart
Emotion distribution	Donut/Bar Chart
Stress trend	Line Chart
Cardiovascular risk trend	Line Chart
Chat activity	Line Chart
Reports trend	Line Chart
Individual patient readings	Line/Area Charts
Detailed records	Data Tables
One important design decision

Don't turn the Admin dashboard into a collection of 20 graphs.

The Dashboard should be an overview. Detailed analytics belong inside the respective pages.

For example:

Dashboard
    ↓
"12 abnormal patients"
    ↓
Patients / Health Monitoring
    ↓
Select Patient
    ↓
Heart Rate / SpO₂ / Temperature history
    ↓
Cardiovascular + Stress Assessment
    ↓
Digital Twin + Emotion
    ↓
Reports

That gives you a very clean story for the final-year project:

Users → Patients → IoT Devices → Physiological Data → AI Assessments → Emotion AI → Digital Twin → Recommendations → Reports

And importantly, this structure matches the models you've already planned rather than introducing unrelated Admin functionality.