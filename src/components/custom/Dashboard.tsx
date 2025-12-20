"use client";
import NavigationTabs from "./NavigationTabs";
import StatsCards from "./statCards";
import ODHoursModal from "./ODHoursModal";
import GradesModal from "./Exams/GradesModal";
import AttendanceTabs from "./attendance/attendanceTabs";
import ExamsSubTabs from "./Exams/ExamSubsTab";
import MarksDisplay from "./Exams/marksDislay";
import ScheduleDisplay from "./Exams/SchduleDisplay";
import HostelSubTabs from "./Hostel/HostelSubsTab";
import MessDisplay from "./Hostel/messDisplay";
import LaundryDisplay from "./Hostel/LaundryDisplay";
import AttendanceSubTabs from "./attendance/AttendanceSubsTabs";
import CalendarView from "./attendance/CalendarView";
import { useState } from "react";
import { useRef } from "react";
import LeaveDisplay from "./Hostel/LeaveDisplay";
import AllGradesDisplay from "./Exams/AllGradesDisplay";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Menu, X, Calendar, Save } from "lucide-react";
import config from "@/app/config.json";

export default function DashboardContent({
  activeTab,
  setActiveTab,
  handleLogOutRequest,
  handleReloadRequest,
  GradesData,
  allGradesData,
  attendancePercentage,
  ODhoursData,
  ODhoursIsOpen,
  setODhoursIsOpen,
  GradesDisplayIsOpen,
  setGradesDisplayIsOpen,
  attendanceData,
  activeDay,
  setActiveDay,
  marksData,
  activeSubTab,
  setActiveSubTab,
  ScheduleData,
  hostelData,
  HostelActiveSubTab,
  setHostelActiveSubTab,
  activeAttendanceSubTab,
  setActiveAttendanceSubTab,
  calendarData,
  CGPAHidden,
  setCGPAHidden,
  calendarType,
  setCalender,
  setCalenderType,
  setIsReloading,
  setProgressBar,
  setMessage,
  loginToVTOP,
  setAllGradesData,
  sethostelData,
  setGradesData,
  setScheduleData,
  currSemesterID,
  setCurrSemesterID,
  handleLogin,
}) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const hasMoved = useRef(false);

  const tabsOrder = ["attendance", "exams", "hostel"];
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(currSemesterID);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    hasMoved.current = false;
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    touchEndX.current = touch.clientX;
    touchEndY.current = touch.clientY;

    const diffX = Math.abs(touchStartX.current - touchEndX.current);
    const diffY = Math.abs(touchStartY.current - touchEndY.current);

    if (diffX > diffY && diffX > 10) hasMoved.current = true;
  };

  const handleTouchEnd = (e) => {
    if (!hasMoved.current) return;

    const diffX = touchStartX.current - touchEndX.current;
    const diffY = touchStartY.current - touchEndY.current;

    if (Math.abs(diffY) > Math.abs(diffX)) return;

    const target = e.target.closest("button, a, input, textarea, select, [data-prevent-swipe]");
    if (target) return;

    const scrollable = e.target.closest("[data-scrollable], [style*='overflow-x']");
    if (scrollable) return;

    if (Math.abs(diffX) < 75) return;

    const currentIndex = tabsOrder.indexOf(activeTab);
    if (diffX > 0 && currentIndex < tabsOrder.length - 1) {
      setActiveTab(tabsOrder[currentIndex + 1]);
    } else if (diffX < 0 && currentIndex > 0) {
      setActiveTab(tabsOrder[currentIndex - 1]);
    }
  };

  const handleAllGradesFetch = async () => {
    setIsReloading(true);
    try {
      const { cookies, dashboardHtml } = await loginToVTOP();

      const AllGradesRes = await fetch("/api/fetchAllGrades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookies: cookies, dashboardHtml: dashboardHtml }),
      });

      const AllGradesData = await AllGradesRes.json();
      setProgressBar((prev) => prev + 40);

      setAllGradesData(AllGradesData);
      localStorage.setItem("allGradesData", JSON.stringify(AllGradesData));

      setMessage((prev) => prev + "\n✅ All grades reloaded successfully!");
      setProgressBar(100);
      setIsReloading(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ Calendar fetch failed, check console.");
      setProgressBar(0);
    }
  };

  const handleCalendarFetch = async (FncalendarType) => {
    setIsReloading(true);
    try {
      const { cookies, dashboardHtml } = await loginToVTOP();

      const calenderRes = await fetch("/api/parseSemTT", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookies: cookies,
          dashboardHtml: dashboardHtml,
          type: FncalendarType || "ALL",
          semesterId: currSemesterID
        }),
      });

      const CalenderRes = await calenderRes.json();
      setProgressBar((prev) => prev + 40);

      setCalender(CalenderRes);
      setCalenderType(FncalendarType);
      localStorage.setItem("calender", JSON.stringify(CalenderRes));
      localStorage.setItem("calendarType", FncalendarType);

      setMessage((prev) => prev + "\n✅ Calendar reloaded successfully!");
      setProgressBar(100);
      setIsReloading(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ Calendar fetch failed, check console.");
      setProgressBar(0);
    }
  };

  const handleFetchGrades = async () => {
    setIsReloading(true);
    try {
      const { cookies, dashboardHtml } = await loginToVTOP();

      const gradesRes = await fetch("/api/fetchGrades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookies, dashboardHtml, semesterId: currSemesterID }),
      });

      const gradesData = await gradesRes.json();
      setProgressBar((prev) => prev + 40);

      setGradesData(gradesData);
      localStorage.setItem("grades", JSON.stringify(gradesData));

      setMessage((prev) => prev + "\n✅ Grades reloaded successfully!");
      setProgressBar(100);
      setIsReloading(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ Grades fetch failed, check console.");
      setProgressBar(0);
    }
  };

  const handleHostelDetailsFetch = async () => {
    setIsReloading(true);
    try {
      const { cookies, dashboardHtml } = await loginToVTOP();

      const HostelRes = await fetch("/api/fetchHostelDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookies: cookies, dashboardHtml: dashboardHtml }),
      });
      const HostelData = await HostelRes.json();
      setProgressBar((prev) => prev + 40);
      sethostelData(HostelData);
      localStorage.setItem("hostelData", JSON.stringify(HostelData));
      setMessage((prev) => prev + "\n✅ Hostel details reloaded successfully!");
      setProgressBar(100);
      setIsReloading(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ Hostel details fetch failed, check console.");
      setProgressBar(0);
    }
  };

  const handleScheduleFetch = async () => {
    setIsReloading(true);
    try {
      const { cookies, dashboardHtml } = await loginToVTOP();

      const ScheduleRes = await fetch("/api/fetchExamSchedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookies: cookies, dashboardHtml: dashboardHtml, semesterId: currSemesterID }),
      });
      const ScheduleData = await ScheduleRes.json();
      setProgressBar((prev) => prev + 40);
      setScheduleData(ScheduleData);
      localStorage.setItem("schedule", JSON.stringify(ScheduleData));
      setMessage((prev) => prev + "\n✅ Schedule reloaded successfully!");
      setProgressBar(100);
      setIsReloading(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ Schedule fetch failed, check console.");
      setProgressBar(0);
    }
  };

  const handleSaveSemester = async () => {
    if (!selectedSemester) return;
    setShowSemesterModal(false);
    setIsReloading(true);
    await handleLogin(selectedSemester);
    setCurrSemesterID(selectedSemester);
    localStorage.setItem("currSemesterID", selectedSemester);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-slate-800 midnight:bg-gray-900 shadow-sm rounded-full p-1 border border-slate-200 dark:border-slate-700 midnight:border-gray-800">
              <TabsTrigger value="attendance" className="rounded-full px-6 data-[state=active]:bg-slate-600 data-[state=active]:text-white">
                Attendance
              </TabsTrigger>
              <TabsTrigger value="exams" className="rounded-full px-6 data-[state=active]:bg-slate-600 data-[state=active]:text-white">
                Exams
              </TabsTrigger>
              <TabsTrigger value="hostel" className="rounded-full px-6 data-[state=active]:bg-slate-600 data-[state=active]:text-white">
                Hostel
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              {/* Semester selection button */}
              <button
                onClick={() => setShowSemesterModal(true)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 midnight:hover:bg-gray-800 transition-colors"
                aria-label="Change Semester"
              >
                <Calendar className="w-5 h-5" />
              </button>

              {/* Mobile stats menu button */}
              <button
                onClick={() => setShowMobileStats(!showMobileStats)}
                className="md:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 midnight:hover:bg-gray-800 transition-colors"
                aria-label="Toggle Stats"
              >
                {showMobileStats ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <button
                onClick={handleReloadRequest}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 midnight:hover:bg-gray-800 transition-colors"
                aria-label="Reload"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={handleLogOutRequest}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 midnight:hover:bg-gray-800 transition-colors"
                aria-label="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>

          {/* Semester selection modal */}
          {showSemesterModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 midnight:bg-black rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700 midnight:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 midnight:text-slate-100">
                    Select Semester
                  </h2>
                  <button onClick={() => setShowSemesterModal(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 midnight:hover:bg-gray-900">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 midnight:border-gray-800 rounded-xl bg-white dark:bg-slate-800 midnight:bg-black text-slate-800 dark:text-slate-200 midnight:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    {config.semesterIDs?.map((id: string, index: number) => (
                      <option key={index} value={id}>
                        {id.endsWith("1") ? `FALLSEM` : `WINTERSEM`} {id.slice(4, -4)}-{id.slice(6, -2)}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleSaveSemester}
                    disabled={!selectedSemester || selectedSemester === currSemesterID}
                    className={`w-full px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                      !selectedSemester || selectedSemester === currSemesterID
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500"
                        : "bg-slate-600 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600"
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    Save & Reload Data
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-900 midnight:bg-black min-h-screen rounded-3xl p-4">
            {/* Desktop stats - always visible on md+ */}
            <div className="hidden md:block">
              <StatsCards
                attendancePercentage={attendancePercentage}
                ODhoursData={ODhoursData}
                setODhoursIsOpen={setODhoursIsOpen}
                feedbackStatus={GradesData.feedback}
                marksData={marksData}
                setGradesDisplayIsOpen={setGradesDisplayIsOpen}
                CGPAHidden={CGPAHidden}
                setCGPAHidden={setCGPAHidden}
              />
            </div>

            {/* Mobile stats - slide-in panel */}
            {showMobileStats && (
              <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileStats(false)}>
                <div 
                  className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-900 midnight:bg-black shadow-2xl overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 bg-white dark:bg-slate-900 midnight:bg-black p-4 border-b border-slate-200 dark:border-slate-700 midnight:border-gray-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 midnight:text-slate-100">Statistics</h2>
                    <button onClick={() => setShowMobileStats(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 midnight:hover:bg-gray-900">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <MobileStatCard
                      title="Attendance"
                      value={attendancePercentage.percentage || 0}
                      color="blue"
                      onClick={() => {}}
                    />
                    <MobileStatCard
                      title="OD Hours"
                      value={`${ODhoursData && ODhoursData.length > 0 && ODhoursData[0].courses ? ODhoursData.reduce((sum, day) => sum + day.total, 0) : 0}/40`}
                      color="purple"
                      onClick={() => { setODhoursIsOpen(true); setShowMobileStats(false); }}
                    />
                    {GradesData.feedback && (
                      <MobileStatCard
                        title="Feedback"
                        value={
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-slate-500 dark:text-slate-400">Mid</span>
                              <span className={`text-xl font-bold ${GradesData.feedback?.MidSem?.Curriculum && GradesData.feedback?.MidSem?.Course ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                {GradesData.feedback?.MidSem?.Curriculum && GradesData.feedback?.MidSem?.Course ? "✓" : "✗"}
                              </span>
                            </div>
                            <div className="h-8 w-[1px] bg-slate-300 dark:bg-slate-700" />
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-slate-500 dark:text-slate-400">End</span>
                              <span className={`text-xl font-bold ${GradesData.feedback?.EndSem?.Curriculum && GradesData.feedback?.EndSem?.Course ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                {GradesData.feedback?.EndSem?.Curriculum && GradesData.feedback?.EndSem?.Course ? "✓" : "✗"}
                              </span>
                            </div>
                          </div>
                        }
                        color="amber"
                        onClick={() => {}}
                      />
                    )}
                    {marksData.cgpa && (
                      <MobileStatCard
                        title="CGPA"
                        value={CGPAHidden ? "•••" : marksData?.cgpa?.cgpa}
                        color="emerald"
                        onClick={() => setCGPAHidden((prev) => !prev)}
                      />
                    )}
                    {marksData.cgpa && (
                      <MobileStatCard
                        title="Credits"
                        value={Number(marksData?.cgpa?.creditsEarned) + Number(marksData?.cgpa?.nonGradedRequirement || 0)}
                        color="rose"
                        onClick={() => { setGradesDisplayIsOpen(true); setShowMobileStats(false); }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {ODhoursIsOpen && (
              <ODHoursModal
                ODhoursData={ODhoursData}
                onClose={() => setODhoursIsOpen(false)}
              />
            )}

            {GradesDisplayIsOpen && (
              <GradesModal
                GradesData={GradesData}
                marksData={marksData}
                onClose={() => setGradesDisplayIsOpen(false)}
                handleFetchGrades={handleFetchGrades}
                attendance={attendanceData.attendance}
              />
            )}

            <TabsContent value="attendance">
              {attendanceData?.attendance && (
                <div className="animate-fadeIn space-y-6">
                  <AttendanceSubTabs
                    activeSubTab={activeAttendanceSubTab}
                    setActiveAttendanceSubTab={setActiveAttendanceSubTab}
                  />

                  {activeAttendanceSubTab === "attendance" && (
                    <AttendanceTabs
                      data={attendanceData}
                      activeDay={activeDay}
                      setActiveDay={setActiveDay}
                      calendars={calendarData.calendars}
                    />
                  )}

                  {activeAttendanceSubTab === "calendar" && (
                    <CalendarView
                      calendars={calendarData.calendars}
                      calendarType={calendarType}
                      handleCalendarFetch={handleCalendarFetch}
                    />
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="exams">
              {marksData && (
                <div className="animate-fadeIn space-y-6">
                  <ExamsSubTabs
                    activeSubTab={activeSubTab}
                    setActiveSubTab={setActiveSubTab}
                  />
                  {activeSubTab === "marks" && <MarksDisplay data={marksData} />}
                  {activeSubTab === "schedule" && <ScheduleDisplay data={ScheduleData} handleScheduleFetch={handleScheduleFetch} />}
                  {activeSubTab === "grades" && <AllGradesDisplay data={allGradesData} handleAllGradesFetch={handleAllGradesFetch} />}
                </div>
              )}
            </TabsContent>

            <TabsContent value="hostel">
              <div className="animate-fadeIn space-y-6">
                <HostelSubTabs
                  HostelActiveSubTab={HostelActiveSubTab}
                  setHostelActiveSubTab={setHostelActiveSubTab}
                  hostelData={hostelData}
                />
                {HostelActiveSubTab === "mess" && <MessDisplay hostelData={hostelData} handleHostelDetailsFetch={handleHostelDetailsFetch} />}
                {HostelActiveSubTab === "laundry" && <LaundryDisplay hostelData={hostelData} handleHostelDetailsFetch={handleHostelDetailsFetch} />}
                {HostelActiveSubTab === "leave" && <LeaveDisplay leaveData={hostelData.leaveHistory} handleHostelDetailsFetch={handleHostelDetailsFetch} />}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function MobileStatCard({ title, value, color, onClick }) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-950/30 midnight:bg-blue-950/20 border-blue-200 dark:border-blue-800/30 midnight:border-blue-900/30 text-blue-700 dark:text-blue-300 midnight:text-blue-200",
    purple: "bg-purple-50 dark:bg-purple-950/30 midnight:bg-purple-950/20 border-purple-200 dark:border-purple-800/30 midnight:border-purple-900/30 text-purple-700 dark:text-purple-300 midnight:text-purple-200",
    amber: "bg-amber-50 dark:bg-amber-950/30 midnight:bg-amber-950/20 border-amber-200 dark:border-amber-800/30 midnight:border-amber-900/30 text-amber-700 dark:text-amber-300 midnight:text-amber-200",
    emerald: "bg-emerald-50 dark:bg-emerald-950/30 midnight:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30 midnight:border-emerald-900/30 text-emerald-700 dark:text-emerald-300 midnight:text-emerald-200",
    rose: "bg-rose-50 dark:bg-rose-950/30 midnight:bg-rose-950/20 border-rose-200 dark:border-rose-800/30 midnight:border-rose-900/30 text-rose-700 dark:text-rose-300 midnight:text-rose-200",
  };

  return (
    <div 
      className={`p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all ${colorClasses[color]}`}
      onClick={onClick}
    >
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function CalendarTabWrapper({ calendarType, handleCalendarFetch }) {
  const CALENDAR_TYPES = {
    ALL: "General Semester",
    ALL02: "General Flexible",
    ALL03: "General Freshers",
    ALL05: "General LAW",
    ALL06: "Flexible Freshers",
    ALL08: "Cohort LAW",
    ALL11: "Flexible Research",
    WEI: "Weekend Intra Semester",
  };

  const [selectedType, setSelectedType] = useState(calendarType || "ALL");

  function handleSubmitCalendarType() {
    handleCalendarFetch(selectedType);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-5 p-6 text-center">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 midnight:text-slate-100">
        Select Calendar Type
      </h2>

      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 
                   dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100
                   midnight:bg-black midnight:text-slate-100 midnight:border-gray-800
                   focus:outline-none focus:ring-2 focus:ring-slate-400 transition"
      >
        {Object.entries(CALENDAR_TYPES).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <button
        onClick={handleSubmitCalendarType}
        className="px-6 py-2 rounded-md font-medium text-white bg-slate-600 hover:bg-slate-700 
                   dark:bg-slate-700 dark:hover:bg-slate-600
                   midnight:bg-slate-800 midnight:hover:bg-slate-700
                   transition-colors duration-150"
      >
        Submit
      </button>
    </div>
  );
}
