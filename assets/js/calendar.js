(function () {
  "use strict";

  document.getElementById("year").textContent = new Date().getFullYear();

  // ── Storage keys ──
  var STORAGE_KEY    = "minje-calendar-v1";
  var NOTES_KEY      = "minje-calendar-notes-v1";
  var SCHEDULES_KEY  = "minje-calendar-schedules-v1";
  var WEEK_NOTES_KEY = "minje-calendar-week-notes-v1";
  var MON_NOTES_KEY  = "minje-calendar-month-notes-v1";
  var MEMOS_KEY      = "minje-calendar-memos-v1";
  var ONSITE_SEED_KEY   = "minje-calendar-onsite-seed-2026-v3";
  var MEETINGS_SEED_KEY = "minje-calendar-meetings-seed-2026-v1";
  var CLEAR_SCHEDULES_KEY = "minje-calendar-clear-schedules-2026-06-24-v1";
  var SNU_PERSONAL_SEED_KEY = "minje-calendar-snu-personal-2026-v2";
  var SNU_GROUP_MEMO_SEED_KEY = "minje-calendar-snu-group-memo-2026-v1";
  var SNU_INTERNSHIP_SEED_KEY = "minje-calendar-snu-internship-report-2026-v2";
  var ISP_PERSONAL_SEED_KEY = "minje-calendar-isp-personal-2026-v1";
  var ISP_DEADLINE_SEED_KEY = "minje-calendar-isp-deadlines-2026-v3";
  var SKKU_LECTURE_SEED_KEY = "minje-calendar-skku-lecture-2026-v4";
  var SNU_MEETING_SCHEDULE = "SNU";
  var ISP_MEETING_SCHEDULE = "ISP";
  var SKKU_OFFICIAL_SCHEDULE = "SKKU";
  var SKKU_SCHEDULE = "성균논어";

  var ONSITE_CLASS_ITEMS = [
    { key: "2026-06-22", id: "onsite-class-2026-06-22" },
    { key: "2026-06-24", id: "onsite-class-2026-06-24" },
    { key: "2026-06-29", id: "onsite-class-2026-06-29" },
    { key: "2026-07-01", id: "onsite-class-2026-07-01" },
    { key: "2026-07-06", id: "onsite-class-2026-07-06" },
    { key: "2026-07-08", id: "onsite-class-2026-07-08" },
    { key: "2026-07-10", id: "onsite-class-2026-07-10" }
  ];

  var WEEKDAYS    = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  var MONTHS      = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var MONTHS_SHORT= ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var DAYNAMES    = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var DAY_MS = 86400000;

  // ── Load / save ──
  function load(key, fallback) {
    try { var r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
    catch(e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); }
    catch(e) { alert("Could not save (storage may be full)."); }
  }

  var data      = load(STORAGE_KEY,    {});
  var notes     = load(NOTES_KEY,      {});
  var schedules = load(SCHEDULES_KEY,  {});
  var weekNotes = load(WEEK_NOTES_KEY, {});
  var monNotes  = load(MON_NOTES_KEY,  {});
  var memos     = load(MEMOS_KEY,      {});

  function saveData()      { save(STORAGE_KEY,    data); }
  function saveNotes()     { save(NOTES_KEY,      notes); }
  function saveSchedules() { save(SCHEDULES_KEY,  schedules); }
  function saveWeekNotes() { save(WEEK_NOTES_KEY, weekNotes); }
  function saveMonNotes()  { save(MON_NOTES_KEY,  monNotes); }
  function saveMemos()     { save(MEMOS_KEY,      memos); }

  function clearExistingSchedulesOnce() {
    if (localStorage.getItem(CLEAR_SCHEDULES_KEY)) return;
    data = {};
    schedules = {};
    saveData();
    saveSchedules();
    localStorage.setItem(CLEAR_SCHEDULES_KEY, "1");
  }
  clearExistingSchedulesOnce();

  // ── Seed onsite classes ──
  function seedOnsiteClasses() {
    if (localStorage.getItem(ONSITE_SEED_KEY)) return;
    var SCH = "성균 논어 현장 수업";
    if (!schedules[SCH]) { schedules[SCH] = { colorKey: "teal" }; saveSchedules(); }
    var changed = false;
    ONSITE_CLASS_ITEMS.forEach(function(entry) {
      if (!data[entry.key]) data[entry.key] = [];
      var exists = data[entry.key].some(function(item) {
        if (item.id === entry.id || item.text === SCH || item.text === "현장 수업") {
          item.id = entry.id; item.text = SCH; item.type = "event";
          item.allDay = false; item.start = "11:00"; item.end = "13:00";
          item.scheduleName = SCH;
          changed = true; return true;
        }
        return false;
      });
      if (!exists) {
        data[entry.key].push({
          id: entry.id, text: SCH, type: "event",
          allDay: false, start: "11:00", end: "13:00",
          important: false, scheduleName: SCH
        });
        changed = true;
      }
    });
    localStorage.setItem(ONSITE_SEED_KEY, "1");
    if (changed) saveData();
  }
  // Seed disabled: start from an empty schedule.

  // ── Recurring meetings seed ──
  function getDaysBetween(startKey, endKey, dow) {
    // dow: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
    var result = [];
    var p = startKey.split("-").map(Number);
    var cur = new Date(p[0], p[1]-1, p[2]);
    var p2 = endKey.split("-").map(Number);
    var end = new Date(p2[0], p2[1]-1, p2[2]);
    while (cur <= end) {
      if (cur.getDay() === dow) {
        result.push(cur.getFullYear() + "-" +
          String(cur.getMonth()+1).padStart(2,"0") + "-" +
          String(cur.getDate()).padStart(2,"0"));
      }
      cur = new Date(cur.getTime() + 86400000);
    }
    return result;
  }

  function seedSnuPersonalMeeting() {
    if (localStorage.getItem(SNU_PERSONAL_SEED_KEY)) return;
    if (!schedules[SNU_MEETING_SCHEDULE]) schedules[SNU_MEETING_SCHEDULE] = {};
    schedules[SNU_MEETING_SCHEDULE].colorKey = "snu";
    saveSchedules();

    Object.keys(data).forEach(function(key) {
      var next = itemsFor(key).filter(function(item) {
        return !(
          /^snu-personal-\d{4}-\d{2}-\d{2}$/.test(item.id || "") ||
          /^snu-group-\d{4}-\d{2}-\d{2}$/.test(item.id || "") ||
          /^pm-\d{4}-\d{2}-\d{2}$/.test(item.id || "") ||
          /^gm-\d{4}-\d{2}-\d{2}$/.test(item.id || "")
        );
      });
      if (next.length) data[key] = next;
      else delete data[key];
    });

    getDaysBetween("2026-06-30", "2026-08-11", 2).forEach(function(key) {
      if (!data[key]) data[key] = [];
      if (!data[key].some(function(it){ return it.id === "snu-personal-" + key; })) {
        data[key].push({
          id: "snu-personal-" + key,
          text: "Personal Meeting",
          type: "event",
          allDay: false,
          start: "15:00",
          end: "16:00",
          important: false,
          scheduleName: SNU_MEETING_SCHEDULE
        });
      }
    });

    getDaysBetween("2026-06-26", "2026-08-14", 5).forEach(function(key) {
      if (!data[key]) data[key] = [];
      if (!data[key].some(function(it){ return it.id === "snu-group-" + key; })) {
        data[key].push({
          id: "snu-group-" + key,
          text: "Group Meeting",
          type: "event",
          allDay: false,
          start: "11:00",
          end: "13:00",
          important: false,
          scheduleName: SNU_MEETING_SCHEDULE
        });
      }
    });

    localStorage.setItem(SNU_PERSONAL_SEED_KEY, "1");
    saveData();
  }
  seedSnuPersonalMeeting();

  function upsertMemo(key, id, title, body) {
    if (!memos[key]) memos[key] = [];
    var memo = memos[key].find(function(m){ return m.id === id; });
    if (memo) {
      memo.title = title;
      memo.body = body;
    } else {
      memos[key].push({
        id: id,
        title: title,
        body: body,
        createdAt: new Date().toISOString()
      });
    }
  }
  function upsertItemMemo(key, itemId, title, body) {
    var item = itemsFor(key).find(function(it){ return it.id === itemId; });
    if (!item) return false;
    item.memo = { title: title || "Item memo", body: body || "" };
    delete item.note;
    return true;
  }
  function removeStandaloneMemo(key, memoId) {
    if (!Array.isArray(memos[key])) return false;
    var next = memos[key].filter(function(m){ return m.id !== memoId; });
    if (next.length === memos[key].length) return false;
    if (next.length) memos[key] = next;
    else delete memos[key];
    return true;
  }
  var SNU_GROUP_MEETING_LOCATIONS = {
    "2026-06-26": "56-1 3F meeting room 1",
    "2026-07-03": "56-1 3F meeting room 1",
    "2026-07-10": "56-1 3F meeting room 1",
    "2026-07-17": "56-1 3F meeting room 1",
    "2026-07-24": "56-1 3F meeting room 1"
  };
  function snuGroupMeetingLocation(key) {
    return SNU_GROUP_MEETING_LOCATIONS[key] || "Bldg 56-1 (3rd floor) or Bldg 56 (Rm 322)";
  }
  function findSnuGroupMeetingItem(key) {
    return itemsFor(key).find(function(item) {
      return item.id === "snu-group-" + key ||
        item.id === "gm-" + key ||
        (item.scheduleName === SNU_MEETING_SCHEDULE &&
          (item.text === "Group Meeting" || item.text === "SNU Group Meeting"));
    });
  }
  function upsertSnuGroupMeetingMemo(key) {
    var item = findSnuGroupMeetingItem(key);
    if (!item) return false;
    item.memo = {
      title: "SNU Group Meeting",
      body: "Location: " + snuGroupMeetingLocation(key)
    };
    delete item.note;
    return true;
  }

  function seedSnuGroupMeetingMemos() {
    if (localStorage.getItem(SNU_GROUP_MEMO_SEED_KEY)) return;
    if (!schedules[SNU_MEETING_SCHEDULE]) schedules[SNU_MEETING_SCHEDULE] = {};
    schedules[SNU_MEETING_SCHEDULE].colorKey = "snu";

    getDaysBetween("2026-06-26", "2026-08-14", 5).forEach(function(key) {
      upsertSnuGroupMeetingMemo(key);
      removeStandaloneMemo(key, "snu-group-location-memo-" + key);
    });

    var specialKey = "2026-06-30";
    if (!data[specialKey]) data[specialKey] = [];
    var special = data[specialKey].find(function(item) {
      return item.id === "snu-personal-" + specialKey ||
        item.id === "snu-group-special-" + specialKey ||
        (item.scheduleName === SNU_MEETING_SCHEDULE && item.text === "Personal Meeting");
    });
    if (special) {
      special.text = "Group Meeting";
      special.type = "event";
      special.allDay = false;
      special.start = special.start || "15:00";
      special.end = special.end || "16:00";
      special.important = true;
      special.scheduleName = SNU_MEETING_SCHEDULE;
    } else {
      special = {
        id: "snu-group-special-" + specialKey,
        text: "Group Meeting",
        type: "event",
        allDay: false,
        start: "15:00",
        end: "16:00",
        important: true,
        scheduleName: SNU_MEETING_SCHEDULE
      };
      data[specialKey].push(special);
    }
    upsertItemMemo(
      specialKey,
      special.id || "snu-group-special-" + specialKey,
      "SNU Group Meeting",
      "Location: " + snuGroupMeetingLocation(specialKey) + "\nResearch topic selection"
    );
    removeStandaloneMemo(specialKey, "snu-group-location-memo-" + specialKey);
    removeStandaloneMemo(specialKey, "snu-group-topic-memo-" + specialKey);

    localStorage.setItem(SNU_GROUP_MEMO_SEED_KEY, "1");
    saveData();
    saveMemos();
    saveSchedules();
  }
  seedSnuGroupMeetingMemos();

  function seedSnuInternshipReport() {
    if (localStorage.getItem(SNU_INTERNSHIP_SEED_KEY)) return;
    var key = "2026-08-11";
    if (!schedules[SNU_MEETING_SCHEDULE]) schedules[SNU_MEETING_SCHEDULE] = {};
    schedules[SNU_MEETING_SCHEDULE].colorKey = "snu";
    if (!data[key]) data[key] = [];
    var internshipItem = data[key].find(function(it){
      return it.id === "snu-internship-report-2026-08-11";
    });
    if (!internshipItem) {
      internshipItem = {
        id: "snu-internship-report-2026-08-11",
        text: "인턴십결과보고 서류 제출",
        type: "todo",
        allDay: true,
        important: true,
        done: false,
        scheduleName: SNU_MEETING_SCHEDULE
      };
      data[key].push(internshipItem);
    }
    var internshipMemoBody = "가. 출석부 및 결과보고서(붙임5): 지도교수 서명 필수, 보고서 최소 3장 이상 작성 요망\n\n(반드시 서명으로 받아와야 함/ 도장은 인정 불가하며, 불가피하게 도장날인 시 지도교수가 보고서 내용을 확인했다는 이메일 등 증빙 추가제출)\n\n나. 건강보험취득실확인서: 2026. 7. 20. 이후 발급분만 인정\n\n다. 통장사본: 장려금 지급받을 학생 본인명의의 계좌\n\n※ 서류누락 시 장려금 지급 불가, 타 과제 참여여부 변동 시 바로 보고";
    internshipItem.memo = {
      title: "인턴십결과보고 제출 서류",
      body: internshipMemoBody
    };
    delete internshipItem.note;
    removeStandaloneMemo(key, "snu-internship-report-memo-2026-08-11");
    localStorage.setItem(SNU_INTERNSHIP_SEED_KEY, "1");
    saveData();
    saveMemos();
    saveSchedules();
  }
  seedSnuInternshipReport();

  function seedIspPersonalMeeting() {
    if (localStorage.getItem(ISP_PERSONAL_SEED_KEY)) return;
    if (!schedules[ISP_MEETING_SCHEDULE]) schedules[ISP_MEETING_SCHEDULE] = {};
    schedules[ISP_MEETING_SCHEDULE].colorKey = "red";
    saveSchedules();

    getDaysBetween("2026-07-01", "2026-08-31", 3).forEach(function(key) {
      if (!data[key]) data[key] = [];
      if (!data[key].some(function(it){ return it.id === "isp-personal-" + key; })) {
        data[key].push({
          id: "isp-personal-" + key,
          text: "Personal Meeting",
          type: "event",
          allDay: false,
          start: "17:00",
          end: "18:00",
          important: false,
          scheduleName: ISP_MEETING_SCHEDULE
        });
      }
    });

    localStorage.setItem(ISP_PERSONAL_SEED_KEY, "1");
    saveData();
  }
  seedIspPersonalMeeting();

  function seedIspDeadlines() {
    if (localStorage.getItem(ISP_DEADLINE_SEED_KEY)) return;
    if (!schedules[ISP_MEETING_SCHEDULE]) schedules[ISP_MEETING_SCHEDULE] = {};
    schedules[ISP_MEETING_SCHEDULE].colorKey = "red";
    saveSchedules();

    [
      {
        key: "2026-07-22",
        id: "isp-abstract-deadline-2026-07-22",
        text: "AAAI Abstract deadline",
        memoId: "isp-abstract-deadline-memo-2026-07-22",
        memo: "Official deadline: July 21, 2026 11:59 PM UTC-12\nKST: July 22, 2026 8:59 PM"
      },
      {
        key: "2026-07-29",
        id: "isp-full-paper-deadline-2026-07-29",
        text: "AAAI Full paper deadline",
        memoId: "isp-full-paper-deadline-memo-2026-07-29",
        memo: "Official deadline: July 28, 2026 11:59 PM UTC-12\nKST: July 29, 2026 8:59 PM"
      },
      {
        key: "2026-08-01",
        id: "isp-supp-code-deadline-2026-08-01",
        text: "AAAI Supplementary material & code deadline",
        memoId: "isp-supp-code-deadline-memo-2026-08-01",
        memo: "Official deadline: July 31, 2026 11:59 PM UTC-12\nKST: August 1, 2026 8:59 PM"
      }
    ].forEach(function(entry) {
      if (!data[entry.key]) data[entry.key] = [];
      var existing = data[entry.key].find(function(it){ return it.id === entry.id; });
      if (existing) {
        existing.text = entry.text;
        existing.type = "todo";
        existing.allDay = true;
        existing.important = true;
        existing.done = !!existing.done;
        existing.scheduleName = ISP_MEETING_SCHEDULE;
      } else {
        existing = {
          id: entry.id,
          text: entry.text,
          type: "todo",
          allDay: true,
          important: true,
          done: false,
          scheduleName: ISP_MEETING_SCHEDULE
        };
        data[entry.key].push(existing);
      }
      existing.memo = { title: entry.text, body: entry.memo };
      delete existing.note;
      removeStandaloneMemo(entry.key, entry.memoId);
    });

    localStorage.setItem(ISP_DEADLINE_SEED_KEY, "1");
    saveData();
    saveMemos();
  }
  seedIspDeadlines();

  function seedSkkuLecture() {
    if (localStorage.getItem(SKKU_LECTURE_SEED_KEY)) return;
    if (schedules["SKKU"]) delete schedules["SKKU"];
    if (schedules["성균 논어 현장 수업"]) delete schedules["성균 논어 현장 수업"];
    if (!schedules[SKKU_SCHEDULE]) schedules[SKKU_SCHEDULE] = {};
    schedules[SKKU_SCHEDULE].colorKey = "forest";
    saveSchedules();

    function upsertSkkuItem(key, id, attrs) {
      if (!data[key]) data[key] = [];
      var item = data[key].find(function(it){ return it.id === id; });
      if (!item) {
        data[key].push(Object.assign({ id: id }, attrs));
        return;
      }
      Object.keys(attrs).forEach(function(name) {
        item[name] = attrs[name];
      });
    }

    Object.keys(data).forEach(function(key) {
      if (key <= "2026-07-10") return;
      var next = itemsFor(key).filter(function(item) {
        return !(
          (item.id && item.id.indexOf("skku-lecture-") === 0) ||
          (item.scheduleName === SKKU_SCHEDULE && item.text === "현장 수업")
        );
      });
      if (next.length) data[key] = next;
      else delete data[key];
    });

    getDaysBetween("2026-06-22", "2026-07-08", 1)
      .concat(getDaysBetween("2026-06-22", "2026-07-08", 3))
      .sort()
      .forEach(function(key) {
        upsertSkkuItem(key, "skku-lecture-" + key, {
          text: "현장 수업",
          type: "event",
          allDay: false,
          start: "11:00",
          end: "13:00",
          important: false,
          scheduleName: SKKU_SCHEDULE
        });
      });

    upsertSkkuItem("2026-07-10", "skku-final-2026-07-10", {
      text: "기말",
      type: "event",
      allDay: true,
      important: true,
      scheduleName: SKKU_SCHEDULE
    });

    upsertSkkuItem("2026-06-28", "skku-rp1-2026-06-28", {
      text: "1차 RP 과제",
      type: "todo",
      allDay: false,
      start: "23:59",
      important: true,
      done: false,
      scheduleName: SKKU_SCHEDULE
    });

    upsertSkkuItem("2026-07-05", "skku-rp2-2026-07-05", {
      text: "2차 RP 과제",
      type: "todo",
      allDay: false,
      start: "23:59",
      important: true,
      done: false,
      scheduleName: SKKU_SCHEDULE
    });

    localStorage.setItem(SKKU_LECTURE_SEED_KEY, "1");
    saveData();
  }
  seedSkkuLecture();

  function normalizeSkkuSchedule() {
    var changed = false;
    Object.keys(data).forEach(function(key) {
      if (key > "2026-07-10") {
        var next = itemsFor(key).filter(function(item) {
          return !(
            (item.id && item.id.indexOf("skku-lecture-") === 0) ||
            (item.scheduleName === SKKU_SCHEDULE && item.text === "현장 수업")
          );
        });
        if (next.length !== itemsFor(key).length) {
          if (next.length) data[key] = next;
          else delete data[key];
          changed = true;
        }
      }
      itemsFor(key).forEach(function(item) {
        var before = JSON.stringify(item);
        if (
          item.scheduleName === "SKKU" ||
          item.scheduleName === "성균 논어 현장 수업" ||
          (item.id && item.id.indexOf("skku-") === 0)
        ) {
          item.scheduleName = SKKU_SCHEDULE;
          if (item.text === "성균 논어 현장 수업") item.text = "현장 수업";
          if (item.text === "성논 기말") item.text = "기말";
          if (String(item.text || "").indexOf("1차 RP") === 0) item.text = "1차 RP 과제";
          if (String(item.text || "").indexOf("2차 RP") === 0) item.text = "2차 RP 과제";
          if (String(item.text || "").indexOf("RP") > -1) {
            item.type = "todo";
            item.allDay = false;
            item.start = item.start || "23:59";
            item.done = !!item.done;
          }
        }
        if (JSON.stringify(item) !== before) changed = true;
      });
    });
    if (schedules["SKKU"]) { delete schedules["SKKU"]; changed = true; }
    if (schedules["성균 논어 현장 수업"]) { delete schedules["성균 논어 현장 수업"]; changed = true; }
    if (!schedules[SKKU_SCHEDULE]) { schedules[SKKU_SCHEDULE] = { colorKey: "forest" }; changed = true; }
    if (schedules[SKKU_SCHEDULE].colorKey !== "forest") {
      schedules[SKKU_SCHEDULE].colorKey = "forest";
      changed = true;
    }
    if (changed) { saveData(); saveSchedules(); }
  }
  normalizeSkkuSchedule();

  function syncSkkuOfficialSchedule() {
    var changedData = false;
    var changedMemos = false;
    if (!schedules[SKKU_OFFICIAL_SCHEDULE]) schedules[SKKU_OFFICIAL_SCHEDULE] = {};
    schedules[SKKU_OFFICIAL_SCHEDULE].colorKey = "forest";
    saveSchedules();

    function upsertOfficial(key, id, text, rangeLabel, important) {
      var rangeParts = rangeLabel ? rangeLabel.split(" to ") : [];
      if (!data[key]) data[key] = [];
      var item = data[key].find(function(it){ return it.id === id; });
      var attrs = {
        text: text,
        type: "event",
        allDay: false,
        start: "09:00",
        end: "10:00",
        important: !!important,
        scheduleName: SKKU_OFFICIAL_SCHEDULE
      };
      if (rangeParts.length === 2 && rangeParts[1] > key) {
        attrs.rangeStart = key;
        attrs.rangeEnd = rangeParts[1];
      }
      if (item) {
        Object.keys(attrs).forEach(function(name) { item[name] = attrs[name]; });
        if (!attrs.rangeStart) {
          delete item.rangeStart;
          delete item.rangeEnd;
        }
      } else {
        data[key].push(Object.assign({ id: id }, attrs));
      }
      changedData = true;

      if (rangeLabel) {
        var officialItem = data[key].find(function(it){ return it.id === id; });
        if (officialItem) {
          officialItem.memo = { title: text, body: "Period: " + rangeLabel };
          delete officialItem.note;
        }
        removeStandaloneMemo(key, id + "-memo");
        changedMemos = true;
      }
    }

    upsertOfficial("2026-06-29", "skku-official-grade-open-2026-spring", "1학기 성적 공시", "2026-06-29 to 2026-07-03", false);
    upsertOfficial("2026-07-07", "skku-official-grade-final-2026-spring", "1학기 성적 확정", "", true);
    upsertOfficial("2026-08-31", "skku-official-fall-start-2026", "2학기 개강", "", false);
    upsertOfficial("2026-08-31", "skku-official-course-change-2026-fall", "수강신청 확인/변경", "2026-08-31 to 2026-09-05", false);
    upsertOfficial("2026-09-16", "skku-official-course-withdrawal-2026-fall", "수강철회 신청", "2026-09-16 to 2026-09-18", false);
    upsertOfficial("2026-10-19", "skku-official-midterm-2026-fall", "2학기 중간시험", "2026-10-19 to 2026-10-23", false);
    upsertOfficial("2026-12-14", "skku-official-final-2026-fall", "2학기 기말시험", "2026-12-14 to 2026-12-18", false);
    upsertOfficial("2026-12-14", "skku-official-grade-input-2026-fall", "2학기 성적 입력", "2026-12-14 to 2026-12-23", false);
    upsertOfficial("2026-12-18", "skku-official-fall-end-2026", "2학기 종강", "", false);
    upsertOfficial("2026-12-24", "skku-official-grade-open-2026-fall", "2학기 성적 공시", "2026-12-24 to 2026-12-30", true);
    upsertOfficial("2026-12-30", "skku-official-three-cert-2026-winter", "3품인증 취득증빙 제출기한", "", true);
    upsertOfficial("2027-01-05", "skku-official-grade-final-2026-fall", "2학기 성적 확정", "", true);

    if (changedData) saveData();
    if (changedMemos) saveMemos();
  }
  syncSkkuOfficialSchedule();

  function normalizeItemMemos() {
    var changedData = false;
    var changedMemos = false;

    Object.keys(data).forEach(function(key) {
      itemsFor(key).forEach(function(item) {
        if (item.note && !item.memo) {
          item.memo = {
            title: item.type === "todo" ? "To-do memo" : "Schedule memo",
            body: item.note
          };
          delete item.note;
          changedData = true;
        }
      });
    });

    getDaysBetween("2026-06-26", "2026-08-14", 5).forEach(function(key) {
      if (upsertSnuGroupMeetingMemo(key)) {
        changedData = true;
      }
      if (removeStandaloneMemo(key, "snu-group-location-memo-" + key)) changedMemos = true;
    });
    var specialKey = "2026-06-30";
    var special = itemsFor(specialKey).find(function(item) {
      return item.id === "snu-group-special-" + specialKey ||
        item.id === "snu-personal-" + specialKey ||
        (item.scheduleName === SNU_MEETING_SCHEDULE && item.text === "Group Meeting");
    });
    if (special) {
      special.memo = {
        title: "SNU Group Meeting",
        body: "Location: " + snuGroupMeetingLocation(specialKey) + "\nResearch topic selection"
      };
      delete special.note;
      changedData = true;
    }
    if (removeStandaloneMemo(specialKey, "snu-group-location-memo-" + specialKey)) changedMemos = true;
    if (removeStandaloneMemo(specialKey, "snu-group-topic-memo-" + specialKey)) changedMemos = true;

    if (upsertItemMemo("2026-08-11", "snu-internship-report-2026-08-11", "인턴십결과보고 제출 서류", "가. 출석부 및 결과보고서(붙임5): 지도교수 서명 필수, 보고서 최소 3장 이상 작성 요망\n\n(반드시 서명으로 받아와야 함/ 도장은 인정 불가하며, 불가피하게 도장날인 시 지도교수가 보고서 내용을 확인했다는 이메일 등 증빙 추가제출)\n\n나. 건강보험취득실확인서: 2026. 7. 20. 이후 발급분만 인정\n\n다. 통장사본: 장려금 지급받을 학생 본인명의의 계좌\n\n※ 서류누락 시 장려금 지급 불가, 타 과제 참여여부 변동 시 바로 보고")) changedData = true;
    if (removeStandaloneMemo("2026-08-11", "snu-internship-report-memo-2026-08-11")) changedMemos = true;

    [
      ["2026-07-22", "isp-abstract-deadline-2026-07-22", "isp-abstract-deadline-memo-2026-07-22", "AAAI Abstract deadline", "Official deadline: July 21, 2026 11:59 PM UTC-12\nKST: July 22, 2026 8:59 PM"],
      ["2026-07-29", "isp-full-paper-deadline-2026-07-29", "isp-full-paper-deadline-memo-2026-07-29", "AAAI Full paper deadline", "Official deadline: July 28, 2026 11:59 PM UTC-12\nKST: July 29, 2026 8:59 PM"],
      ["2026-08-01", "isp-supp-code-deadline-2026-08-01", "isp-supp-code-deadline-memo-2026-08-01", "AAAI Supplementary material & code deadline", "Official deadline: July 31, 2026 11:59 PM UTC-12\nKST: August 1, 2026 8:59 PM"]
    ].forEach(function(entry) {
      if (upsertItemMemo(entry[0], entry[1], entry[3], entry[4])) changedData = true;
      if (removeStandaloneMemo(entry[0], entry[2])) changedMemos = true;
    });

    [
      ["2026-06-29", "skku-official-grade-open-2026-spring", "2026-06-29 to 2026-07-03"],
      ["2026-08-31", "skku-official-course-change-2026-fall", "2026-08-31 to 2026-09-05"],
      ["2026-09-16", "skku-official-course-withdrawal-2026-fall", "2026-09-16 to 2026-09-18"],
      ["2026-10-19", "skku-official-midterm-2026-fall", "2026-10-19 to 2026-10-23"],
      ["2026-12-14", "skku-official-final-2026-fall", "2026-12-14 to 2026-12-18"],
      ["2026-12-14", "skku-official-grade-input-2026-fall", "2026-12-14 to 2026-12-23"],
      ["2026-12-24", "skku-official-grade-open-2026-fall", "2026-12-24 to 2026-12-30"]
    ].forEach(function(entry) {
      var item = itemsFor(entry[0]).find(function(it){ return it.id === entry[1]; });
      if (item) {
        item.memo = { title: item.text, body: "Period: " + entry[2] };
        delete item.note;
        changedData = true;
      }
      if (removeStandaloneMemo(entry[0], entry[1] + "-memo")) changedMemos = true;
    });

    if (changedData) saveData();
    if (changedMemos) saveMemos();
  }
  normalizeItemMemos();

  function seedMeetings() {
    if (localStorage.getItem(MEETINGS_SEED_KEY)) return;

    // Schedules
    if (!schedules[SNU_MEETING_SCHEDULE])      schedules[SNU_MEETING_SCHEDULE]      = { colorKey: "snu" };
    schedules[SNU_MEETING_SCHEDULE].colorKey = "snu";
    if (!schedules["ISP Lab Personal Meeting"])schedules["ISP Lab Personal Meeting"]= { colorKey: "green" };
    delete schedules["SNU 미팅"];
    delete schedules["Personal Meeting"];
    delete schedules["Group Meeting"];
    saveSchedules();

    // SNU Personal Meeting: Tuesdays 11:00-12:00, Jun 30 → Aug 31
    getDaysBetween("2026-06-30", "2026-08-31", 2).forEach(function(key) {
      if (!data[key]) data[key] = [];
      if (!data[key].some(function(it){ return it.id === "pm-" + key; }))
        data[key].push({ id: "pm-"+key, text: "SNU Personal Meeting", type: "event",
          allDay: false, start: "11:00", end: "12:00",
          important: false, scheduleName: SNU_MEETING_SCHEDULE });
    });

    // SNU Group Meeting: Fridays 11:00-12:00, Jun 26 → Aug 31
    getDaysBetween("2026-06-26", "2026-08-31", 5).forEach(function(key) {
      if (!data[key]) data[key] = [];
      if (!data[key].some(function(it){ return it.id === "gm-" + key; }))
        data[key].push({ id: "gm-"+key, text: "SNU Group Meeting", type: "event",
          allDay: false, start: "11:00", end: "12:00",
          important: false, scheduleName: SNU_MEETING_SCHEDULE });
    });

    // ISP Lab Personal Meeting: Tuesdays all-day, Jun 30 → Jul 31
    getDaysBetween("2026-06-30", "2026-07-31", 2).forEach(function(key) {
      if (!data[key]) data[key] = [];
      if (!data[key].some(function(it){ return it.id === "isp-" + key; }))
        data[key].push({ id: "isp-"+key, text: "ISP Lab Personal Meeting", type: "event",
          allDay: true, important: false, scheduleName: "ISP Lab Personal Meeting" });
    });

    localStorage.setItem(MEETINGS_SEED_KEY, "1");
    saveData();
  }
  // Seed disabled: start from an empty schedule.

  function migrateScheduleColors() {
    var forced = {
      "성균 논어 현장 수업":       "forest",
      "ISP Lab Personal Meeting": "red"
    };
    var changed = false;
    Object.keys(forced).forEach(function(name) {
      if (!schedules[name]) { schedules[name] = {}; changed = true; }
      if (schedules[name].colorKey !== forced[name]) {
        schedules[name].colorKey = forced[name];
        changed = true;
      }
    });
    if (changed) saveSchedules();
  }
  // Seed color migration disabled while schedule is empty.

  function normalizeSnuMeetings() {
    var changedData = false;
    var changedSchedules = false;
    if (!schedules[SNU_MEETING_SCHEDULE]) {
      schedules[SNU_MEETING_SCHEDULE] = { colorKey: "snu" };
      changedSchedules = true;
    }
    if (schedules[SNU_MEETING_SCHEDULE].colorKey !== "snu") {
      schedules[SNU_MEETING_SCHEDULE].colorKey = "snu";
      changedSchedules = true;
    }
    ["SNU 미팅", "Personal Meeting", "Group Meeting"].forEach(function(name) {
      if (schedules[name]) {
        delete schedules[name];
        changedSchedules = true;
      }
    });
    Object.keys(data).forEach(function(key) {
      itemsFor(key).forEach(function(item) {
        var before = JSON.stringify(item);
        if (
          (item.id && item.id.indexOf("pm-") === 0) ||
          (item.id && item.id.indexOf("gm-") === 0) ||
          item.scheduleName === "SNU 미팅" ||
          item.scheduleName === "Personal Meeting" ||
          item.scheduleName === "Group Meeting" ||
          item.text === "Personal Meeting" ||
          item.text === "Group Meeting" ||
          item.text === "SNU Personal Meeting" ||
          item.text === "SNU Group Meeting"
        ) {
          if ((item.id && item.id.indexOf("pm-") === 0) || item.text === "Personal Meeting") {
            item.text = "SNU Personal Meeting";
            item.allDay = false;
            item.start = "11:00";
            item.end = "12:00";
          }
          if ((item.id && item.id.indexOf("gm-") === 0) || item.text === "Group Meeting") {
            item.text = "SNU Group Meeting";
            item.allDay = false;
            item.start = "11:00";
            item.end = "12:00";
          }
          if (item.scheduleName !== SNU_MEETING_SCHEDULE) {
            item.scheduleName = SNU_MEETING_SCHEDULE;
            changedData = true;
          }
          if (String(item.text || "").indexOf("SNU ") !== 0) {
            item.text = "SNU " + item.text;
          }
          item.scheduleName = SNU_MEETING_SCHEDULE;
        }
        if (JSON.stringify(item) !== before) changedData = true;
      });
    });
    if (changedData) saveData();
    if (changedSchedules) saveSchedules();
  }
  // SNU normalization disabled while schedule is empty.

  // ── Date utils ──
  function pad(n) { return String(n).padStart(2, "0"); }
  function keyOf(date) {
    return date.getFullYear() + "-" + pad(date.getMonth()+1) + "-" + pad(date.getDate());
  }
  function dateFromKey(key) {
    var p = key.split("-").map(Number);
    return new Date(p[0], p[1]-1, p[2]);
  }
  function mondayOf(date) {
    var d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() - (d.getDay() + 6) % 7);
    return d;
  }
  function isoWeekKey(date) {
    var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    var day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    var yr = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var wn = Math.ceil((((d - yr) / 86400000) + 1) / 7);
    return d.getUTCFullYear() + "-W" + pad(wn);
  }
  function monthKey(date) { return date.getFullYear() + "-" + pad(date.getMonth()+1); }
  function timeToMinutes(t) {
    var p = t.split(":"); return parseInt(p[0])*60 + parseInt(p[1]);
  }
  function weekRangeLabel(date) {
    var mon = mondayOf(date);
    var sun = new Date(mon.getTime() + 6 * DAY_MS);
    var wk  = isoWeekKey(date).split("-W")[1];
    var label = "W" + wk + " · " + MONTHS_SHORT[mon.getMonth()] + " " + mon.getDate();
    if (mon.getMonth() !== sun.getMonth())
      label += "–" + MONTHS_SHORT[sun.getMonth()] + " " + sun.getDate();
    else
      label += "–" + sun.getDate();
    return label;
  }

  var COLOR_OPTIONS = [
    { key: "default", name: "Auto",    bg: "#eef2f5", fg: "#18202a", solid: "#667085" },
    { key: "teal",    name: "Teal",    bg: "#e2f2f4", fg: "#145767", solid: "#1f7a8c" },
    { key: "green",   name: "Green",   bg: "#e4f3ea", fg: "#1f6b43", solid: "#2f8f5b" },
    { key: "forest",  name: "Forest",  bg: "#d1eddb", fg: "#0d4d24", solid: "#166534" },
    { key: "blue",    name: "Blue",    bg: "#e8eefc", fg: "#244aa3", solid: "#3867d6" },
    { key: "snu",     name: "SNU",     bg: "#dce8f6", fg: "#002d6b", solid: "#003876" },
    { key: "navy",    name: "Navy",    bg: "#dde8f5", fg: "#002d6b", solid: "#003876" },
    { key: "violet",  name: "Violet",  bg: "#eee8fb", fg: "#5b3aa3", solid: "#7c5cc7" },
    { key: "orange",  name: "Orange",  bg: "#f8e7dc", fg: "#8a3f14", solid: "#c86b31" },
    { key: "amber",   name: "Amber",   bg: "#fef3e2", fg: "#92400e", solid: "#d97706" },
    { key: "red",     name: "Red",     bg: "#fee2e2", fg: "#991b1b", solid: "#dc2626" },
    { key: "rose",    name: "Rose",    bg: "#fbe7ed", fg: "#9f2948", solid: "#d45073" },
    { key: "slate",   name: "Slate",   bg: "#e9edf2", fg: "#344054", solid: "#667085" }
  ];

  function colorOption(key) {
    return COLOR_OPTIONS.find(function(o){ return o.key === key; }) || COLOR_OPTIONS[0];
  }
  var MEMO_COLOR = { bg: "#fff7ed", fg: "#8a3f14", solid: "#d97706" };

  var FORCED_COLORS = {
    "성균 논어 현장 수업":       "forest",
    "ISP Lab Personal Meeting": "red",
    "SNU":                       "snu",
    "ISP":                       "red",
    "SKKU":                      "forest",
    "성균논어":                  "forest"
  };

  function itemsFor(key) { return Array.isArray(data[key]) ? data[key] : []; }
  function memosFor(key) { return Array.isArray(memos[key]) ? memos[key] : []; }
  function memoToItem(memo, sourceKey) {
    return {
      id: "memo-" + (memo.id || sourceKey),
      text: memo.title || "Memo",
      type: "memo",
      allDay: true,
      important: false,
      rangeStart: memo.rangeStart,
      rangeEnd: memo.rangeEnd,
      memo: { title: memo.title || "Memo", body: memo.body || "" },
      sourceKey: sourceKey,
      memoId: memo.id
    };
  }
  function isRangeItem(item) {
    return item.rangeStart && item.rangeEnd && item.rangeEnd > item.rangeStart;
  }
  function rangeContains(item, key) {
    return isRangeItem(item) && item.rangeStart <= key && key <= item.rangeEnd;
  }
  function displayItemsFor(key) {
    var direct = itemsFor(key).slice();
    memosFor(key).forEach(function(memo) {
      direct.push(memoToItem(memo, key));
    });
    Object.keys(data).forEach(function(sourceKey) {
      if (sourceKey === key) return;
      itemsFor(sourceKey).forEach(function(item) {
        if (rangeContains(item, key)) direct.push(item);
      });
    });
    Object.keys(memos).forEach(function(sourceKey) {
      if (sourceKey === key) return;
      memosFor(sourceKey).forEach(function(memo) {
        var item = memoToItem(memo, sourceKey);
        if (rangeContains(item, key)) direct.push(item);
      });
    });
    return direct;
  }
  function rangeItemsForWeek(monday) {
    var weekStart = keyOf(monday);
    var weekEnd = keyOf(new Date(monday.getTime() + 6 * DAY_MS));
    var ranges = [];
    Object.keys(data).forEach(function(sourceKey) {
      itemsFor(sourceKey).forEach(function(item) {
        if (!isRangeItem(item)) return;
        if (item.rangeEnd < weekStart || item.rangeStart > weekEnd) return;
        ranges.push({
          item: item,
          start: item.rangeStart,
          end: item.rangeEnd,
          weekLabelKey: item.rangeStart < weekStart ? weekStart : item.rangeStart
        });
      });
    });
    Object.keys(memos).forEach(function(sourceKey) {
      memosFor(sourceKey).forEach(function(memo) {
        var item = memoToItem(memo, sourceKey);
        if (!isRangeItem(item)) return;
        if (item.rangeEnd < weekStart || item.rangeStart > weekEnd) return;
        ranges.push({
          item: item,
          start: item.rangeStart,
          end: item.rangeEnd,
          weekLabelKey: item.rangeStart < weekStart ? weekStart : item.rangeStart
        });
      });
    });
    ranges.sort(function(a, b) {
      return a.start.localeCompare(b.start) ||
        a.end.localeCompare(b.end) ||
        itemDisplayText(a.item).localeCompare(itemDisplayText(b.item));
    });
    return ranges;
  }
  function itemSortValue(item) {
    return (item.allDay === false && item.start) ? item.start : "00:00";
  }
  function itemColor(item) {
    if (item.type === "memo") return MEMO_COLOR;
    var sch = item.scheduleName;
    if (sch) {
      if (schedules[sch] && schedules[sch].colorKey)
        return colorOption(schedules[sch].colorKey);
      if (FORCED_COLORS[sch]) return colorOption(FORCED_COLORS[sch]);
    }
    if (item.colorKey) return colorOption(item.colorKey);
    return item.type === "todo"
      ? { bg: "#e4f3ea", fg: "#1f6b43", solid: "#2f8f5b" }
      : { bg: "#e9edf2", fg: "#344054", solid: "#667085" };
  }

  function changeScheduleColor(name, colorKey) {
    if (!schedules[name]) schedules[name] = {};
    schedules[name].colorKey = colorKey;
    saveSchedules();
    Object.keys(data).forEach(function(k) {
      if (itemsFor(k).some(function(it){ return it.scheduleName === name; }))
        refreshDayCell(k);
    });
    refreshVisibleDays();
    renderOverview(); renderScheduleStrip();
  }

  function hexAlpha(hex, a) {
    var r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return "rgba("+r+","+g+","+b+","+a+")";
  }
  function applyItemColors(el, item) {
    var c = itemColor(item);
    el.style.background      = c.bg;
    el.style.color           = c.fg;
    el.style.borderColor     = item.important ? "#dc2626" : hexAlpha(c.solid, 0.2);
    el.style.borderLeftColor = item.important ? "#dc2626" : c.solid;
  }
  function itemTimeLabel(item) {
    if (item.type === "todo" || item.type === "memo") return "";
    if (item.allDay === false && item.start)
      return item.end ? item.start + "–" + item.end : item.start;
    return "All-day";
  }
  function itemDisplayText(item) {
    if (item.type === "memo") return "Memo : " + item.text;
    return item.scheduleName ? item.scheduleName + " : " + item.text : item.text;
  }
  function itemChipText(item) {
    var p = (item.type !== "todo" && item.allDay === false && item.start) ? item.start + " " : "";
    return p + itemDisplayText(item);
  }
  function makeTodoToggle(item, key) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "todo-toggle" + (item.done ? " checked" : "");
    btn.setAttribute("aria-label", item.done ? "Mark to-do as open" : "Mark to-do as done");
    btn.setAttribute("aria-pressed", item.done ? "true" : "false");
    btn.title = item.done ? "Mark as open" : "Mark as done";
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleTodoDone(key, item.id);
    });
    return btn;
  }
  function toggleTodoDone(key, id) {
    var item = itemsFor(key).find(function(it){ return it.id === id; });
    if (!item) {
      Object.keys(data).some(function(sourceKey) {
        item = itemsFor(sourceKey).find(function(it){ return it.id === id; });
        return !!item;
      });
    }
    if (!item || item.type !== "todo") return;
    item.done = !item.done;
    saveData();
    refreshVisibleDays();
    renderOverview();
  }

  // ── Calendar setup ──
  var weekdaysEl = document.getElementById("weekdays");
  WEEKDAYS.forEach(function(name, i) {
    var el = document.createElement("div");
    el.className = "weekday" + (i===6?" sun":i===5?" sat":"");
    el.textContent = name;
    weekdaysEl.appendChild(el);
  });

  var weeksEl    = document.getElementById("weeks");
  var viewport   = document.getElementById("viewport");
  var monthLabel = document.getElementById("month-label");

  var today      = new Date();
  var todayKey   = keyOf(today);
  var selectedKey = todayKey;
  var anchorMonday = mondayOf(today);
  var loadedStart = 0, loadedEnd = -1;

  function mondayForOffset(offset) {
    return new Date(anchorMonday.getTime() + offset * 7 * DAY_MS);
  }

  function buildWeek(offset) {
    var monday = mondayForOffset(offset);
    var rangeSlots = rangeItemsForWeek(monday);
    var row = document.createElement("div");
    row.className = "week";
    row.dataset.offset = offset;
    var thu = new Date(monday.getTime() + 3 * DAY_MS);
    row.dataset.month = thu.getMonth();
    row.dataset.year  = thu.getFullYear();
    for (var i = 0; i < 7; i++) {
      var d   = new Date(monday.getTime() + i * DAY_MS);
      var key = keyOf(d);
      var dow = d.getDay();
      var cell = document.createElement("div");
      cell.className =
        "day" +
        (dow===0?" sun":dow===6?" sat":"") +
        (d.getMonth()%2===1?" alt":"") +
        (key===todayKey?" today":"") +
        (key===selectedKey?" selected":"");
      cell.dataset.key  = key;
      cell.dataset.time = d.getTime();
      var head = document.createElement("div");
      head.className = "day-head";
      var num = document.createElement("span");
      num.className = "day-num";
      num.textContent = d.getDate();
      head.appendChild(num);
      if (d.getDate()===1) {
        var ml = document.createElement("span");
        ml.className = "day-month";
        ml.textContent = MONTHS_SHORT[d.getMonth()];
        head.appendChild(ml);
      }
      if (key===todayKey) {
        var badge = document.createElement("span");
        badge.className = "today-badge";
        badge.textContent = "TODAY";
        head.appendChild(badge);
      }
      cell.appendChild(head);
      cell.appendChild(buildChips(key, rangeSlots));
      row.appendChild(cell);
    }
    row.appendChild(buildRangeLayer(monday, rangeSlots));
    return row;
  }

  var CHIP_SLOT_H = 20; // chip ~17px + 3px gap

  function makeChip(it, key, opts) {
    opts = opts || {};
    var chip = document.createElement("div");
    chip.className = "chip " + it.type + (it.done ? " done" : "") +
      (opts.range ? " range" : "") +
      (opts.rangeStart ? " range-start" : "") +
      (opts.rangeEnd ? " range-end" : "");
    applyItemColors(chip, it);
    var span = document.createElement("span");
    span.className = "chip-text";
    if (it.important) {
      var mark = document.createElement("span");
      mark.className = "important-mark";
      mark.textContent = "!";
      span.appendChild(mark);
    }
    span.appendChild(document.createTextNode(opts.range && !opts.showLabel ? "" : itemChipText(it)));
    chip.appendChild(span);
    if (it.type === "todo") {
      chip.appendChild(makeTodoToggle(it, key));
    }
    return chip;
  }

  function checkChipMarquees(container) {
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        container.querySelectorAll(".chip").forEach(function(chip) {
          var t = chip.querySelector(".chip-text");
          if (!t) return;
          // reset
          t.classList.remove("h-scroll");
          t.style.removeProperty("--h-travel");
          t.style.animationDuration = "";
          // check overflow
          if (t.scrollWidth > chip.clientWidth + 1) {
            var dist     = t.scrollWidth - chip.clientWidth + 6;
            var travel   = -dist;
            // 60% of duration is scroll, 20% pause each end
            var duration = Math.max(3.5, dist / 0.6 / 30); // 30px/s scroll speed
            t.style.setProperty("--h-travel", travel + "px");
            t.style.animationDuration = duration + "s";
            t.classList.add("h-scroll");
          }
        });
      });
    });
  }

  function makeRangePlaceholder() {
    var ph = document.createElement("div");
    ph.className = "range-placeholder";
    return ph;
  }

  function dayOffset(from, to) {
    return Math.round((dateFromKey(to).getTime() - from.getTime()) / DAY_MS);
  }

  function buildRangeLayer(monday, rangeSlots) {
    var layer = document.createElement("div");
    layer.className = "range-layer";
    var weekStart = keyOf(monday);
    var weekEnd = keyOf(new Date(monday.getTime() + 6 * DAY_MS));
    (rangeSlots || []).forEach(function(slot, index) {
      var startIdx = Math.max(0, dayOffset(monday, slot.start));
      var endIdx = Math.min(6, dayOffset(monday, slot.end));
      if (endIdx < 0 || startIdx > 6) return;
      var band = makeChip(slot.item, slot.weekLabelKey, {
        range: true,
        rangeStart: slot.start >= weekStart,
        rangeEnd: slot.end <= weekEnd,
        showLabel: true
      });
      band.classList.add("range-band");
      band.style.gridColumn = (startIdx + 1) + " / " + (endIdx + 2);
      band.style.gridRow = (index + 1) + " / " + (index + 2);
      layer.appendChild(band);
    });
    return layer;
  }

  function buildChips(key, rangeSlots) {
    var wrap = document.createElement("div");
    wrap.className = "chips";
    var items = itemsFor(key).filter(function(it){ return !isRangeItem(it); });
    memosFor(key).forEach(function(memo) {
      var item = memoToItem(memo, key);
      if (!isRangeItem(item)) items.push(item);
    });
    (rangeSlots || []).forEach(function(slot) {
      wrap.appendChild(makeRangePlaceholder());
    });

    if (items.length <= 2) {
      items.forEach(function(it) { wrap.appendChild(makeChip(it, key)); });
      return wrap;
    }

    // Sliding scroll: show all items looping infinitely
    wrap.classList.add("chips-scroll");
    var track = document.createElement("div");
    track.className = "chips-track";

    // All items + 2 duplicates at the end for seamless loop
    items.concat(items.slice(0, 2)).forEach(function(it) {
      track.appendChild(makeChip(it, key));
    });

    // Travel exactly N slots so loop lands on duplicated start
    var travel = -(items.length * CHIP_SLOT_H);
    var duration = items.length * 2.8; // ~2.8s per item
    track.style.setProperty("--chips-travel", travel + "px");
    track.style.animationDuration = duration + "s";
    wrap.appendChild(track);
    return wrap;
  }

  function refreshDayCell(key) {
    var cell = weeksEl.querySelector('.day[data-key="' + key + '"]');
    if (!cell) return;
    var old = cell.querySelector(".chips");
    if (old) old.remove();
    var chips = buildChips(key, rangeItemsForWeek(mondayOf(dateFromKey(key))));
    cell.appendChild(chips);
    checkChipMarquees(chips);
  }

  function refreshVisibleDays() {
    weeksEl.querySelectorAll(".day[data-key]").forEach(function(cell) {
      refreshDayCell(cell.dataset.key);
    });
  }

  function appendWeek() {
    loadedEnd += 1;
    var row = buildWeek(loadedEnd);
    weeksEl.appendChild(row);
    checkChipMarquees(row);
  }
  function prependWeek() {
    loadedStart -= 1;
    var row = buildWeek(loadedStart);
    var prevH = weeksEl.offsetHeight, prevS = viewport.scrollTop;
    weeksEl.insertBefore(row, weeksEl.firstChild);
    viewport.scrollTop = prevS + (weeksEl.offsetHeight - prevH);
    checkChipMarquees(row);
  }

  (function initRender() {
    loadedStart = 0; loadedEnd = -1;
    for (var i = 0; i < 5; i++) appendWeek();
    for (var j = 0; j < 4; j++) prependWeek();
    var todayRow = weeksEl.querySelector(".day.today");
    if (todayRow) viewport.scrollTop = todayRow.closest(".week").offsetTop - 2;
    updateMonthLabel();
    checkChipMarquees(weeksEl);
  })();

  function updateMonthLabel() {
    var rows = weeksEl.children, top = viewport.scrollTop, chosen = rows[0];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (r.offsetTop + r.offsetHeight - 4 > top) { chosen = r; break; }
    }
    if (!chosen) return;
    monthLabel.innerHTML = MONTHS[+chosen.dataset.month] +
      ' <span class="year-dim">' + chosen.dataset.year + "</span>";
  }

  var THRESHOLD = 200;
  function fillForScroll() {
    var g = 0;
    while (viewport.scrollTop + viewport.clientHeight > weeksEl.offsetHeight - THRESHOLD && g++ < 12)
      appendWeek();
    g = 0;
    while (viewport.scrollTop < THRESHOLD && g++ < 12)
      prependWeek();
  }
  viewport.addEventListener("scroll", function() { fillForScroll(); updateMonthLabel(); });

  // ── Day selection ──
  var addPanelDate    = document.getElementById("add-panel-date");
  var addPanelWeekday = document.getElementById("add-panel-weekday");
  // Todo tab
  var todoInput         = document.getElementById("todo-input");
  var todoImportant     = document.getElementById("todo-important");
  var todoNoteInput     = document.getElementById("todo-note-input");
  var todoRangeInput    = document.getElementById("todo-range-input");
  var todoRangeRow      = document.getElementById("todo-range-row");
  var todoRangeEndInput = document.getElementById("todo-range-end-input");
  // Schedule tab
  var addInput          = document.getElementById("add-input");
  var scheduleNoteInput = document.getElementById("schedule-note-input");
  var scheduleInput     = document.getElementById("schedule-input");
  var allDayInput   = document.getElementById("all-day-input");
  var rangeInput    = document.getElementById("range-input");
  var rangeRow      = document.getElementById("range-row");
  var rangeEndInput = document.getElementById("range-end-input");
  var timeRow       = document.getElementById("time-row");
  var startInput    = document.getElementById("start-input");
  var endInput      = document.getElementById("end-input");
  var importantInput= document.getElementById("important-input");
  // Note/Memo tab
  var memoTitleInput = document.getElementById("memo-title");
  var memoBodyInput  = document.getElementById("memo-body");
  var memoRangeInput    = document.getElementById("memo-range-input");
  var memoRangeRow      = document.getElementById("memo-range-row");
  var memoRangeEndInput = document.getElementById("memo-range-end-input");
  var memoListEl     = document.getElementById("memo-list");
  var activeColorKey = "default";

  function displayMemosFor(key) {
    var list = memosFor(key).map(function(memo) {
      return Object.assign({ sourceKey: key }, memo);
    });
    Object.keys(memos).forEach(function(sourceKey) {
      if (sourceKey === key) return;
      memosFor(sourceKey).forEach(function(memo) {
        var item = memoToItem(memo, sourceKey);
        if (rangeContains(item, key)) {
          list.push(Object.assign({ sourceKey: sourceKey }, memo));
        }
      });
    });
    return list;
  }

  function renderMemoList(key) {
    memoListEl.innerHTML = "";
    var list = displayMemosFor(key);
    if (!list.length) return;
    list.forEach(function(m) {
      var item = document.createElement("div");
      item.className = "memo-item";
      if (m.title) {
        var t = document.createElement("div");
        t.className = "memo-item-title";
        t.textContent = m.title;
        item.appendChild(t);
      }
      if (m.body) {
        var b = document.createElement("div");
        b.className = "memo-item-body";
        b.textContent = m.body;
        item.appendChild(b);
      }
      var del = document.createElement("button");
      del.className = "memo-item-del"; del.textContent = "×";
      del.title = "Delete memo";
      del.addEventListener("click", (function(id, sourceKey){ return function() {
        memos[sourceKey] = (memos[sourceKey]||[]).filter(function(x){ return x.id !== id; });
        if (!memos[sourceKey].length) delete memos[sourceKey];
        saveMemos(); renderMemoList(key);
        refreshVisibleDays(); renderOverview();
      }; })(m.id, m.sourceKey || key));
      item.appendChild(del);
      memoListEl.appendChild(item);
    });
  }

  function addMemo() {
    if (!selectedKey) return;
    var title = memoTitleInput.value.trim();
    var body  = memoBodyInput.value.trim();
    if (!title && !body) return;
    var isRange = memoRangeInput.checked;
    var rangeEnd = memoRangeEndInput.value || selectedKey;
    if (isRange && rangeEnd < selectedKey) {
      alert("Range end date should be on or after the selected day."); return;
    }
    if (!memos[selectedKey]) memos[selectedKey] = [];
    var memo = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2,7),
      title: title, body: body
    };
    if (isRange && rangeEnd > selectedKey) {
      memo.rangeStart = selectedKey;
      memo.rangeEnd = rangeEnd;
    }
    memos[selectedKey].push(memo);
    saveMemos();
    memoTitleInput.value = ""; memoBodyInput.value = "";
    memoRangeInput.checked = false; memoRangeRow.hidden = true; memoRangeEndInput.value = selectedKey;
    renderMemoList(selectedKey);
    refreshVisibleDays(); renderOverview();
    memoTitleInput.focus();
  }
  document.getElementById("memo-add-btn").addEventListener("click", addMemo);
  memoBodyInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addMemo();
  });

  function renderColorPicker() {
    var swatches  = document.getElementById("color-swatches");
    var lockNote  = document.getElementById("color-lock-note");
    swatches.innerHTML = "";
    var schName   = scheduleInput.value.trim();
    var lockedKey = (schName && schedules[schName]) ? (schedules[schName].colorKey || null) : null;

    COLOR_OPTIONS.filter(function(c){ return c.key !== "default"; }).forEach(function(c) {
      var sw = document.createElement("span");
      var isCurrent = lockedKey ? c.key === lockedKey : c.key === activeColorKey;
      sw.className = "color-swatch" + (isCurrent ? " active" : "") + (lockedKey ? " locked" : "");
      sw.style.background = c.solid;
      sw.title = c.name;
      if (!lockedKey) {
        sw.addEventListener("click", function() {
          activeColorKey = c.key;
          renderColorPicker();
        });
      }
      swatches.appendChild(sw);
    });

    if (lockedKey) {
      lockNote.textContent = "색상은 스케줄 " + schName + "의 색을 따릅니다";
      lockNote.style.display = "block";
    } else {
      lockNote.style.display = "none";
    }
  }

  function selectDay(key, time, opts) {
    selectedKey = key;
    var dt = time ? new Date(+time) : dateFromKey(key);
    var dateStr = MONTHS[dt.getMonth()] + " " + dt.getDate() + ", " + dt.getFullYear();
    var dayStr  = DAYNAMES[dt.getDay()];
    addPanelDate.textContent    = dateStr;
    addPanelWeekday.textContent = dayStr;
    clearItemNotes();
    renderMemoList(selectedKey);
    renderOverview();
    rangeEndInput.min = selectedKey;
    if (!rangeEndInput.value || rangeEndInput.value < selectedKey) {
      rangeEndInput.value = selectedKey;
    }
    todoRangeEndInput.min = selectedKey;
    if (!todoRangeEndInput.value || todoRangeEndInput.value < selectedKey) {
      todoRangeEndInput.value = selectedKey;
    }
    memoRangeEndInput.min = selectedKey;
    if (!memoRangeEndInput.value || memoRangeEndInput.value < selectedKey) {
      memoRangeEndInput.value = selectedKey;
    }

    weeksEl.querySelectorAll(".day.selected").forEach(function(c){ c.classList.remove("selected"); });
    var sel = weeksEl.querySelector('.day[data-key="' + key + '"]');
    if (sel) sel.classList.add("selected");
    if (opts && opts.focusInput) addInput.focus();
  }

  function formatKeyDate(key) {
    var d = dateFromKey(key);
    return MONTHS_SHORT[d.getMonth()] + " " + d.getDate();
  }

  function makeMiniItem(item, key) {
    var li = document.createElement("li");
    li.className = "mini-item";
    var timeLabel = itemTimeLabel(item);
    if (key || timeLabel) {
      var time = document.createElement("span");
      time.className = "mini-item-time";
      time.textContent = key && timeLabel ? formatKeyDate(key) + " · " + timeLabel : (key ? formatKeyDate(key) : timeLabel);
      li.appendChild(time);
    }
    var text = document.createElement("span");
    text.textContent = itemDisplayText(item);
    li.appendChild(text);
    return li;
  }

  function formatShortRange(start, end) {
    var s = MONTHS_SHORT[start.getMonth()] + " " + start.getDate();
    var e = MONTHS_SHORT[end.getMonth()] + " " + end.getDate();
    if (start.getFullYear() !== end.getFullYear()) {
      s += ", " + start.getFullYear();
      e += ", " + end.getFullYear();
    }
    return s + " to " + e;
  }

  // ── Overview panel (right) ──
  function makeOvItem(item, key) {
    var c = itemColor(item);
    var el = document.createElement("div");
    el.className = "ov-item " + item.type + (item.done ? " done" : "");
    el.style.background      = c.bg;
    el.style.color           = c.fg;
    el.style.borderColor     = item.important ? "#dc2626" : hexAlpha(c.solid, 0.2);
    el.style.borderLeftColor = item.important ? "#dc2626" : c.solid;
    if (item.important) {
      var mark = document.createElement("span");
      mark.className = "important-mark";
      mark.textContent = "!";
      el.appendChild(mark);
    }
    if (item.type !== "todo" && item.allDay === false && item.start) {
      var t = document.createElement("span");
      t.className = "ov-item-time";
      t.textContent = item.start;
      el.appendChild(t);
    }
    var tx = document.createElement("span");
    tx.className = "ov-item-text";
    tx.textContent = itemDisplayText(item);
    el.appendChild(tx);
    if (item.type === "todo") {
      el.appendChild(makeTodoToggle(item, key));
    }
    var itemMemo = item.memo || (item.note ? { title: "Item memo", body: item.note } : null);
    if (itemMemo && (itemMemo.title || itemMemo.body)) {
      var detail = document.createElement("div");
      detail.className = "ov-item-note";
      if (itemMemo.title) {
        var title = document.createElement("span");
        title.className = "ov-note-title";
        title.textContent = itemMemo.title;
        detail.appendChild(title);
      }
      if (itemMemo.body) detail.appendChild(document.createTextNode(itemMemo.body));
      el.appendChild(detail);
      el.style.cursor = "pointer";
      el.addEventListener("click", function() { el.classList.toggle("open"); });
    }
    return el;
  }

  function makeOvDayGroup(key, isToday) {
    var items = displayItemsFor(key).filter(function(it){ return it.important; }).sort(function(a,b){
      return itemSortValue(a).localeCompare(itemSortValue(b));
    });
    if (!items.length) return null;
    var d = dateFromKey(key);
    var wrap = document.createElement("div");
    wrap.className = "ov-day";
    var hdr = document.createElement("div");
    hdr.className = "ov-day-hdr" + (isToday ? " is-today" : "");
    hdr.textContent = DAYNAMES[d.getDay()].slice(0,3) + " " +
      MONTHS_SHORT[d.getMonth()] + " " + d.getDate();
    wrap.appendChild(hdr);
    items.forEach(function(it){ wrap.appendChild(makeOvItem(it, key)); });
    return wrap;
  }

  function renderOverview() {
    var baseKey = selectedKey || todayKey;
    var baseDate = dateFromKey(baseKey);

    // ── Selected day ──
    var ovTodayDate = document.getElementById("ov-today-date");
    var ovTodayList = document.getElementById("ov-today-list");
    ovTodayDate.textContent = MONTHS[baseDate.getMonth()] + " " + baseDate.getDate() + ", " + baseDate.getFullYear();
    ovTodayList.innerHTML = "";
    var baseItems = displayItemsFor(baseKey).slice().sort(function(a,b){
      return itemSortValue(a).localeCompare(itemSortValue(b));
    });
    if (!baseItems.length) {
      var emp = document.createElement("div");
      emp.className = "ov-empty"; emp.textContent = "No items.";
      ovTodayList.appendChild(emp);
    } else {
      baseItems.forEach(function(it){ ovTodayList.appendChild(makeOvItem(it, baseKey)); });
    }

    // ── This week (Mon–Sun of selected week, excluding selected day) ──
    var ovWeek = document.getElementById("ov-week");
    ovWeek.innerHTML = "";
    var mon = mondayOf(baseDate);
    var hasWeek = false;
    for (var d2 = 0; d2 < 7; d2++) {
      var wDay = new Date(mon.getTime() + d2 * DAY_MS);
      var wKey = keyOf(wDay);
      if (wKey === baseKey) continue;
      var g = makeOvDayGroup(wKey, false);
      if (g) { ovWeek.appendChild(g); hasWeek = true; }
    }
    if (!hasWeek) {
      var emp3 = document.createElement("div");
      emp3.className = "ov-empty"; emp3.textContent = "None.";
      ovWeek.appendChild(emp3);
    }

    // ── Upcoming 4 weeks (next Mon → +4 weeks) ──
    var ovUpcoming = document.getElementById("ov-upcoming");
    var ovUpcomingLabel = document.getElementById("ov-upcoming-label");
    ovUpcoming.innerHTML = "";
    var nextMon = new Date(mon.getTime() + 7 * DAY_MS);
    var upEnd   = new Date(nextMon.getTime() + 27 * DAY_MS);
    ovUpcomingLabel.textContent = formatShortRange(nextMon, upEnd);

    var curWeekMon = nextMon;
    var weekNames = ["Next week", "2 weeks out", "3 weeks out", "4 weeks out"];
    for (var w = 0; w < 4; w++) {
      var block = document.createElement("div");
      block.className = "ov-week-block";
      var label = document.createElement("div");
      label.className = "ov-week-label";
      var labelTitle = document.createElement("span");
      labelTitle.className = "ov-week-label-title";
      labelTitle.textContent = weekNames[w];
      var weekEnd = new Date(curWeekMon.getTime() + 6 * DAY_MS);
      var labelDate = document.createElement("span");
      labelDate.className = "ov-week-date";
      labelDate.textContent = formatShortRange(curWeekMon, weekEnd);
      label.appendChild(labelTitle);
      label.appendChild(labelDate);
      var body = document.createElement("div");
      body.className = "ov-week-body";
      var weekHasItems = false;
      for (var wd = 0; wd < 7; wd++) {
        var uDay = new Date(curWeekMon.getTime() + wd * DAY_MS);
        var uKey = keyOf(uDay);
        var ug = makeOvDayGroup(uKey, false);
        if (ug) { body.appendChild(ug); weekHasItems = true; }
      }
      if (!weekHasItems) {
        var none = document.createElement("div");
        none.className = "ov-empty";
        none.textContent = "None.";
        body.appendChild(none);
      }
      block.appendChild(label);
      block.appendChild(body);
      ovUpcoming.appendChild(block);
      curWeekMon = new Date(curWeekMon.getTime() + 7 * DAY_MS);
    }
  }

  // ── Schedule strip ──
  function renderScheduleStrip() {
    var strip = document.getElementById("schedule-strip");
    strip.innerHTML = "";
    var names = Object.keys(schedules).sort();
    if (!names.length) return;
    names.forEach(function(name) {
      var sch = schedules[name];
      var opt = colorOption(sch.colorKey || "default");
      var pill = document.createElement("span");
      pill.className = "schedule-pill";
      pill.dataset.schedule = name;

      var dot = document.createElement("span");
      dot.className = "schedule-pill-dot";
      dot.style.background = opt.solid;
      dot.title = "색상 변경";

      var popup = document.createElement("div");
      popup.className = "schedule-color-popup";
      COLOR_OPTIONS.filter(function(c){ return c.key !== "default"; }).forEach(function(c) {
        var sw = document.createElement("span");
        sw.className = "sch-color-opt" + (c.key === (sch.colorKey || "") ? " active" : "");
        sw.style.background = c.solid;
        sw.title = c.name;
        sw.addEventListener("click", function(e) {
          e.stopPropagation();
          changeScheduleColor(name, c.key);
          pill.classList.remove("open");
        });
        popup.appendChild(sw);
      });

      dot.addEventListener("click", function(e) {
        e.stopPropagation();
        document.querySelectorAll(".schedule-pill.open").forEach(function(p){
          if (p !== pill) p.classList.remove("open");
        });
        pill.classList.toggle("open");
      });

      var lbl = document.createElement("span");
      lbl.textContent = name;

      pill.appendChild(dot);
      pill.appendChild(lbl);
      pill.appendChild(popup);
      strip.appendChild(pill);
    });
  }

  document.addEventListener("click", function() {
    document.querySelectorAll(".schedule-pill.open").forEach(function(p){
      p.classList.remove("open");
    });
  });

  function updateScheduleDatalist() {
    var dl = document.getElementById("schedule-list");
    dl.innerHTML = "";
    Object.keys(schedules).forEach(function(name) {
      var opt = document.createElement("option");
      opt.value = name;
      dl.appendChild(opt);
    });
  }

  // ── Tab switching ──
  document.querySelectorAll(".add-tab").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var tab = btn.dataset.tab;
      document.querySelectorAll(".add-tab").forEach(function(b){ b.classList.remove("active"); });
      document.querySelectorAll(".add-tab-panel").forEach(function(p){ p.classList.remove("active"); });
      btn.classList.add("active");
      document.querySelector(".add-tab-panel[data-tab=\"" + tab + "\"]").classList.add("active");
      if (tab === "todo" && todoInput) todoInput.focus();
      if (tab === "schedule" && addInput) addInput.focus();
      if (tab === "note" && memoBodyInput) memoBodyInput.focus();
    });
  });

  // ── Add todo ──
  function addTodo() {
    var text = todoInput.value.trim();
    if (!text || !selectedKey) return;
    var noteText = todoNoteInput.value.trim();
    var isRange = todoRangeInput.checked;
    var rangeEnd = todoRangeEndInput.value || selectedKey;
    if (isRange && rangeEnd < selectedKey) {
      alert("Range end date should be on or after the selected day."); return;
    }
    var item = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2,7),
      text: text, type: "todo", allDay: true,
      important: todoImportant.checked, done: false
    };
    if (noteText) item.memo = { title: "To-do memo", body: noteText };
    if (isRange && rangeEnd > selectedKey) {
      item.rangeStart = selectedKey;
      item.rangeEnd = rangeEnd;
    }
    if (!data[selectedKey]) data[selectedKey] = [];
    data[selectedKey].push(item);
    saveData();
    todoInput.value = ""; todoImportant.checked = false; todoNoteInput.value = "";
    todoRangeInput.checked = false; todoRangeRow.hidden = true; todoRangeEndInput.value = selectedKey;
    renderOverview(); refreshVisibleDays();
    todoInput.focus();
  }
  document.getElementById("todo-add-btn").addEventListener("click", addTodo);
  todoInput.addEventListener("keydown", function(e){ if(e.key==="Enter") addTodo(); });

  // ── Add schedule item ──
  function addScheduleItem() {
    var text = addInput.value.trim();
    if (!text || !selectedKey) return;
    var schName = scheduleInput.value.trim();
    var allDay  = allDayInput.checked || !startInput.value;
    var isRange = rangeInput.checked;
    var rangeEnd = rangeEndInput.value || selectedKey;
    if (isRange && rangeEnd < selectedKey) {
      alert("Range end date should be on or after the selected day."); return;
    }
    if (!allDay && endInput.value && endInput.value <= startInput.value) {
      alert("End time should be after start time."); return;
    }
    var pickedColor = activeColorKey !== "default" ? activeColorKey : null;
    var noteText = scheduleNoteInput.value.trim();
    var item = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2,7),
      text: text, type: "event", allDay: allDay,
      important: importantInput.checked
    };
    if (noteText) item.memo = { title: "Schedule memo", body: noteText };
    if (schName) {
      item.scheduleName = schName;
      if (!schedules[schName]) {
        schedules[schName] = { colorKey: pickedColor || "orange" };
        saveSchedules(); updateScheduleDatalist(); renderScheduleStrip();
      }
    } else if (pickedColor) {
      item.colorKey = pickedColor;
    }
    if (!allDay) {
      item.start = startInput.value;
      if (endInput.value) item.end = endInput.value;
    }
    if (isRange && rangeEnd > selectedKey) {
      item.rangeStart = selectedKey;
      item.rangeEnd = rangeEnd;
    }
    if (!data[selectedKey]) data[selectedKey] = [];
    data[selectedKey].push(item);
    saveData();
    addInput.value = ""; importantInput.checked = false; scheduleNoteInput.value = "";
    rangeInput.checked = false; rangeRow.hidden = true; rangeEndInput.value = selectedKey;
    activeColorKey = "default"; renderColorPicker();
    renderOverview(); refreshVisibleDays();
    addInput.focus();
  }
  document.getElementById("add-btn").addEventListener("click", addScheduleItem);
  addInput.addEventListener("keydown", function(e){ if(e.key==="Enter") addScheduleItem(); });
  scheduleInput.addEventListener("input", renderColorPicker);

  // ── All-day toggle ──
  allDayInput.addEventListener("change", function(){
    timeRow.hidden = allDayInput.checked;
  });
  rangeInput.addEventListener("change", function(){
    rangeRow.hidden = !rangeInput.checked;
    rangeEndInput.min = selectedKey;
    if (!rangeEndInput.value || rangeEndInput.value < selectedKey) {
      rangeEndInput.value = selectedKey;
    }
  });
  todoRangeInput.addEventListener("change", function(){
    todoRangeRow.hidden = !todoRangeInput.checked;
    todoRangeEndInput.min = selectedKey;
    if (!todoRangeEndInput.value || todoRangeEndInput.value < selectedKey) {
      todoRangeEndInput.value = selectedKey;
    }
  });
  memoRangeInput.addEventListener("change", function(){
    memoRangeRow.hidden = !memoRangeInput.checked;
    memoRangeEndInput.min = selectedKey;
    if (!memoRangeEndInput.value || memoRangeEndInput.value < selectedKey) {
      memoRangeEndInput.value = selectedKey;
    }
  });

  // ── Item notes — cleared when day changes (not persisted separately) ──
  function clearItemNotes() {
    todoNoteInput.value = "";
    scheduleNoteInput.value = "";
  }

  // ── Calendar click ──
  weeksEl.addEventListener("click", function(e) {
    var cell = e.target.closest(".day");
    if (!cell) return;
    selectDay(cell.dataset.key, +cell.dataset.time, { focusInput: true });
  });

  // ── Today button ──
  document.getElementById("btn-today").addEventListener("click", function() {
    var tc = weeksEl.querySelector(".day.today");
    if (tc) {
      viewport.scrollTo({ top: tc.closest(".week").offsetTop - 2, behavior: "smooth" });
      selectDay(todayKey, today.getTime());
    }
  });

  // ── Animate stop/play ──
  var animPaused = false;
  document.getElementById("btn-anim").addEventListener("click", function() {
    animPaused = !animPaused;
    document.body.classList.toggle("anim-paused", animPaused);
    this.textContent = animPaused ? "Play" : "Stop";
  });

  // ── ICS export utils ──
  function nextDateKey(key) {
    var p = key.split("-").map(Number);
    return keyOf(new Date(p[0], p[1]-1, p[2]+1));
  }
  function icsDate(key)  { return key.replace(/-/g,""); }
  function icsDateTime(key, time) { return icsDate(key)+"T"+time.replace(":","")+"00"; }
  function icsStamp(date) {
    return date.getUTCFullYear()+pad(date.getUTCMonth()+1)+pad(date.getUTCDate())+
      "T"+pad(date.getUTCHours())+pad(date.getUTCMinutes())+pad(date.getUTCSeconds())+"Z";
  }
  function escapeIcs(t) {
    return String(t).replace(/\\/g,"\\\\").replace(/\r?\n/g,"\\n")
      .replace(/;/g,"\\;").replace(/,/g,"\\,");
  }
  function foldIcsLine(line) {
    var out=[], rest=line;
    while(rest.length>73){ out.push(rest.slice(0,73)); rest=" "+rest.slice(73); }
    out.push(rest); return out.join("\r\n");
  }
  function buildIcs() {
    var lines = ["BEGIN:VCALENDAR","VERSION:2.0",
      "PRODID:-//Minje Park//Personal Calendar//EN",
      "CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-CALNAME:Minje Park Calendar"];
    var stamp = icsStamp(new Date());
    Object.keys(data).sort().forEach(function(key) {
      itemsFor(key).forEach(function(item) {
        var isTodo = item.type === "todo";
        var title  = (isTodo?"To-do: ":"") + itemDisplayText(item);
        var itemMemo = item.memo || (item.note ? { title: "Item memo", body: item.note } : null);
        var desc   = "Type:"+(isTodo?"To-do":"Event")+
          (item.important?"\nPriority:Important":"")+
          (isTodo?"\nStatus:"+(item.done?"Done":"Open"):"")+
          (itemMemo && itemMemo.body ? "\n\n" + (itemMemo.title ? itemMemo.title + "\n" : "") + itemMemo.body : "");
        lines.push("BEGIN:VEVENT",
          "UID:"+escapeIcs((item.id||key+"-"+item.text)+"@pmj0324.github.io"),
          "DTSTAMP:"+stamp);
        if (item.allDay===false && item.start) {
          lines.push("DTSTART:"+icsDateTime(key,item.start));
          if (item.rangeEnd && item.end)
            lines.push("DTEND:"+icsDateTime(item.rangeEnd,item.end));
          else if (item.end && item.end>item.start)
            lines.push("DTEND:"+icsDateTime(key,item.end));
          else lines.push("DURATION:PT1H");
        } else {
          lines.push("DTSTART;VALUE=DATE:"+icsDate(key),
            "DTEND;VALUE=DATE:"+icsDate(nextDateKey(item.rangeEnd || key)));
        }
        lines.push("SUMMARY:"+escapeIcs(title),"DESCRIPTION:"+escapeIcs(desc),
          "STATUS:CONFIRMED","END:VEVENT");
      });
    });
    lines.push("END:VCALENDAR");
    return lines.map(foldIcsLine).join("\r\n")+"\r\n";
  }

  function downloadText(filename, text, type) {
    var blob = new Blob([text], {type:type});
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 0);
  }

  document.getElementById("btn-share").addEventListener("click", function(){
    downloadText("minje-calendar-"+todayKey+".ics", buildIcs(), "text/calendar;charset=utf-8");
  });
  document.getElementById("btn-export").addEventListener("click", function(){
    downloadText("calendar-backup-"+todayKey+".json",
      JSON.stringify({version:4, entries:data, notes:notes, memos:memos,
        schedules:schedules, weekNotes:weekNotes, monNotes:monNotes}, null, 2),
      "application/json");
  });

  var importFile = document.getElementById("import-file");
  document.getElementById("btn-import").addEventListener("click", function(){ importFile.click(); });
  importFile.addEventListener("change", function() {
    var file = importFile.files[0]; if (!file) return;
    var reader = new FileReader();
    reader.onload = function() {
      try {
        var inc = JSON.parse(reader.result);
        if (typeof inc !== "object" || inc === null) throw new Error();
        var incData  = inc.entries || inc;
        var incNotes = inc.entries ? (inc.notes || {}) : {};
        var incSch   = inc.schedules   || {};
        var incWk    = inc.weekNotes   || {};
        var incMon   = inc.monNotes    || {};
        var incMemos = inc.memos       || {};
        if (confirm("Replace current calendar data with the imported file?")) {
          data = incData; notes = incNotes; memos = incMemos;
          schedules = incSch; weekNotes = incWk; monNotes = incMon;
          saveData(); saveNotes(); saveMemos(); saveSchedules(); saveWeekNotes(); saveMonNotes();
          weeksEl.querySelectorAll(".day[data-key]").forEach(function(cell){
            refreshDayCell(cell.dataset.key);
          });
          selectDay(selectedKey);
          renderScheduleStrip();
          updateScheduleDatalist();
        }
      } catch(err) { alert("Could not read that file as calendar JSON."); }
      importFile.value = "";
    };
    reader.readAsText(file);
  });

  // ── Init ──
  selectDay(todayKey, today.getTime());
  renderScheduleStrip();
  updateScheduleDatalist();
  renderColorPicker();

})();
