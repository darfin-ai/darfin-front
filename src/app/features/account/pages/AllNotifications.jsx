import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Bell,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Trash2,
  Check,
  ChevronRight,
  MailOpen,
  Settings
} from "lucide-react";
const allNotifications = [
  {
    id: 1,
    type: "community",
    title: "\uC0C8 \uB313\uAE00",
    message: "\uC791\uC131\uD558\uC2E0 '\uC0BC\uC131\uC804\uC790 \uC2E4\uC801 \uBC1C\uD45C \uC5B4\uB5BB\uAC8C \uBCF4\uC2DC\uB098\uC694?' \uAC8C\uC2DC\uAE00\uC5D0 \uC0C8\uB85C\uC6B4 \uB2F5\uBCC0\uC774 \uB2EC\uB838\uC2B5\uB2C8\uB2E4.",
    time: "10\uBD84 \uC804",
    date: "2026-06-24",
    isRead: false,
    link: "/community/1"
  },
  {
    id: 2,
    type: "disclosure",
    title: "\uAD00\uC2EC \uACF5\uC2DC \uB4F1\uB85D",
    message: "\uCE74\uCE74\uC624(035720)\uC758 \uC0C8\uB85C\uC6B4 \uACF5\uC2DC\uAC00 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4: [\uC8FC\uC694\uC0AC\uD56D\uBCF4\uACE0\uC11C] \uD0C0\uBC95\uC778 \uC8FC\uC2DD \uBC0F \uCD9C\uC790\uC99D\uAD8C \uCDE8\uB4DD\uACB0\uC815",
    time: "35\uBD84 \uC804",
    date: "2026-06-24",
    isRead: false,
    link: "/disclosure/5412"
  },
  {
    id: 3,
    type: "trading",
    title: "\uBAA8\uC758\uD22C\uC790 \uCCB4\uACB0",
    message: "NAVER(035420) \uB9E4\uC218 \uC8FC\uBB38 50\uC8FC\uAC00 \uCCB4\uACB0\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uCCB4\uACB0\uAC00 195,500\uC6D0 / \uCD1D 9,775,000\uC6D0",
    time: "1\uC2DC\uAC04 \uC804",
    date: "2026-06-24",
    isRead: false,
    link: "/trading"
  },
  {
    id: 4,
    type: "community",
    title: "\uC88B\uC544\uC694",
    message: "'\uD558\uC774\uBE0C \uACF5\uC2DC \uBD84\uC11D \uC694\uCCAD\uB4DC\uB9BD\uB2C8\uB2E4' \uAC8C\uC2DC\uAE00\uC5D0 \uC88B\uC544\uC694 10\uAC1C\uAC00 \uB2EC\uB838\uC2B5\uB2C8\uB2E4.",
    time: "3\uC2DC\uAC04 \uC804",
    date: "2026-06-24",
    isRead: true,
    link: "/community/2"
  },
  {
    id: 5,
    type: "disclosure",
    title: "\uAD00\uC2EC \uACF5\uC2DC \uB4F1\uB85D",
    message: "\uC0BC\uC131\uC804\uC790(005930)\uC758 \uC0C8\uB85C\uC6B4 \uACF5\uC2DC\uAC00 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4: [\uC0AC\uC5C5\uBCF4\uACE0\uC11C] 2025\uB144 \uC5F0\uAC04 \uC0AC\uC5C5\uBCF4\uACE0\uC11C",
    time: "5\uC2DC\uAC04 \uC804",
    date: "2026-06-24",
    isRead: true,
    link: "/disclosure/5399"
  },
  {
    id: 6,
    type: "payment",
    title: "\uACB0\uC81C \uC644\uB8CC",
    message: "Darfin Pro \uC815\uAE30 \uACB0\uC81C\uAC00 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uACB0\uC81C\uAE08\uC561: 29,000\uC6D0 / \uB2E4\uC74C \uACB0\uC81C\uC77C: 2026\uB144 7\uC6D4 24\uC77C",
    time: "1\uC77C \uC804",
    date: "2026-06-23",
    isRead: true,
    link: "/subscription"
  },
  {
    id: 7,
    type: "system",
    title: "\uC11C\uBE44\uC2A4 \uC810\uAC80 \uC548\uB0B4",
    message: "\uC11C\uBC84 \uC815\uAE30 \uC810\uAC80\uC774 \uC608\uC815\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4. \uC77C\uC2DC: 2026\uB144 6\uC6D4 25\uC77C (\uBAA9) \uC0C8\uBCBD 02:00 ~ 04:00",
    time: "1\uC77C \uC804",
    date: "2026-06-23",
    isRead: true
  },
  {
    id: 8,
    type: "trading",
    title: "\uBAA8\uC758\uD22C\uC790 \uBAA9\uD45C\uAC00 \uB3C4\uB2EC",
    message: "\uD604\uB300\uCC28(005380) \uC124\uC815\uD558\uC2E0 \uBAA9\uD45C\uAC00 250,000\uC6D0\uC5D0 \uB3C4\uB2EC\uD588\uC2B5\uB2C8\uB2E4. \uD604\uC7AC\uAC00: 251,000\uC6D0 (+0.4%)",
    time: "2\uC77C \uC804",
    date: "2026-06-22",
    isRead: true,
    link: "/trading"
  },
  {
    id: 9,
    type: "community",
    title: "\uB313\uAE00\uC5D0 \uB300\uB313\uAE00",
    message: "'LG\uC5D0\uB108\uC9C0\uC194\uB8E8\uC158 \uACF5\uC2DC \uBD84\uC11D' \uAC8C\uC2DC\uAE00\uC758 \uB0B4 \uB313\uAE00\uC5D0 \uC0C8\uB85C\uC6B4 \uB2F5\uAE00\uC774 \uB2EC\uB838\uC2B5\uB2C8\uB2E4.",
    time: "2\uC77C \uC804",
    date: "2026-06-22",
    isRead: true,
    link: "/community/3"
  },
  {
    id: 10,
    type: "system",
    title: "\uC2E0\uADDC \uAE30\uB2A5 \uC548\uB0B4",
    message: "AI \uACF5\uC2DC \uC694\uC57D \uAE30\uB2A5\uC774 \uC5C5\uB370\uC774\uD2B8\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC774\uC81C \uB354 \uC815\uD655\uD55C \uD575\uC2EC \uBB38\uC7A5 \uD558\uC774\uB77C\uC774\uD2B8\uB97C \uACBD\uD5D8\uD574 \uBCF4\uC138\uC694.",
    time: "3\uC77C \uC804",
    date: "2026-06-21",
    isRead: true
  },
  {
    id: 11,
    type: "disclosure",
    title: "\uAD00\uC2EC \uACF5\uC2DC \uB4F1\uB85D",
    message: "SK\uD558\uC774\uB2C9\uC2A4(000660)\uC758 \uC0C8\uB85C\uC6B4 \uACF5\uC2DC\uAC00 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4: [\uBD84\uAE30\uBCF4\uACE0\uC11C] 2026\uB144 1\uBD84\uAE30",
    time: "3\uC77C \uC804",
    date: "2026-06-21",
    isRead: true,
    link: "/disclosure/5380"
  },
  {
    id: 12,
    type: "payment",
    title: "\uC601\uC218\uC99D \uBC1C\uAE09",
    message: "2026\uB144 5\uC6D4\uBD84 Darfin Pro \uC774\uC6A9 \uC601\uC218\uC99D\uC774 \uBC1C\uAE09\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB9C8\uC774\uD398\uC774\uC9C0\uC5D0\uC11C \uD655\uC778\uD558\uC138\uC694.",
    time: "5\uC77C \uC804",
    date: "2026-06-19",
    isRead: true,
    link: "/mypage"
  }
];
const filterTabs = [
  { key: "all", label: "\uC804\uCCB4" },
  { key: "unread", label: "\uC77D\uC9C0 \uC54A\uC74C" },
  { key: "community", label: "\uCEE4\uBBA4\uB2C8\uD2F0" },
  { key: "disclosure", label: "\uACF5\uC2DC" },
  { key: "trading", label: "\uBAA8\uC758\uD22C\uC790" },
  { key: "system", label: "\uC2DC\uC2A4\uD15C" },
  { key: "payment", label: "\uACB0\uC81C" }
];
const typeConfig = {
  community: {
    icon: <MessageCircle size={16} />,
    bg: "bg-blue-100",
    color: "text-blue-600",
    label: "\uCEE4\uBBA4\uB2C8\uD2F0"
  },
  system: {
    icon: <AlertCircle size={16} />,
    bg: "bg-slate-100",
    color: "text-slate-600",
    label: "\uC2DC\uC2A4\uD15C"
  },
  trading: {
    icon: <TrendingUp size={16} />,
    bg: "bg-emerald-100",
    color: "text-emerald-600",
    label: "\uBAA8\uC758\uD22C\uC790"
  },
  payment: {
    icon: <CreditCard size={16} />,
    bg: "bg-violet-100",
    color: "text-violet-600",
    label: "\uACB0\uC81C"
  },
  disclosure: {
    icon: <CheckCircle2 size={16} />,
    bg: "bg-orange-100",
    color: "text-orange-600",
    label: "\uACF5\uC2DC"
  }
};
function groupByDate(notifications) {
  const today = "2026-06-24";
  const yesterday = "2026-06-23";
  const groups = {};
  notifications.forEach((n) => {
    let label;
    if (n.date === today) {
      label = "\uC624\uB298";
    } else if (n.date === yesterday) {
      label = "\uC5B4\uC81C";
    } else {
      const [, month, day] = n.date.split("-");
      label = `${parseInt(month)}\uC6D4 ${parseInt(day)}\uC77C`;
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  return groups;
}
export function AllNotifications() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState(allNotifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filtered = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.isRead;
    return n.type === activeTab;
  });
  const grouped = groupByDate(filtered);
  const dateOrder = ["\uC624\uB298", "\uC5B4\uC81C"];
  const sortedDates = [
    ...dateOrder.filter((d) => grouped[d]),
    ...Object.keys(grouped).filter((d) => !dateOrder.includes(d))
  ];
  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };
  const markRead = (id) => {
    setNotifications(
      (prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n)
    );
  };
  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };
  const handleNotificationClick = (notif) => {
    markRead(notif.id);
    if (notif.link) navigate(notif.link);
  };
  return <div className="max-w-3xl mx-auto">
      {
    /* Page Header */
  }
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Bell className="text-blue-600" size={22} />
          <h1 className="text-2xl font-bold text-slate-900">알림</h1>
          {unreadCount > 0 && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
              {unreadCount}
            </span>}
        </div>
        <p className="text-sm text-slate-500 ml-9">관심 기업 공시, 커뮤니티 활동, 서비스 알림을 확인하세요.</p>
      </div>

      {
    /* Controls */
  }
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-2">
        {
    /* Filter Tabs */
  }
        <div className="flex items-center gap-1 p-3 border-b border-slate-100 overflow-x-auto">
          {filterTabs.map((tab) => <button
    key={tab.key}
    onClick={() => setActiveTab(tab.key)}
    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${activeTab === tab.key ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"}`}
  >
              {tab.label}
              {tab.key === "unread" && unreadCount > 0 && <span className={`ml-1 ${activeTab === "unread" ? "text-blue-200" : "text-blue-500"}`}>
                  {unreadCount}
                </span>}
            </button>)}
          <div className="flex-1" />
          {unreadCount > 0 && <button
    onClick={markAllRead}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors whitespace-nowrap"
  >
              <MailOpen size={13} />
              모두 읽음
            </button>}
        </div>

        {
    /* Notification List */
  }
        {filtered.length === 0 ? <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
            <Bell size={40} strokeWidth={1.5} />
            <p className="text-sm font-medium">알림이 없습니다.</p>
          </div> : <div>
            {sortedDates.map((dateLabel) => <div key={dateLabel}>
                {
    /* Date Group Header */
  }
                <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{dateLabel}</span>
                </div>

                {grouped[dateLabel].map((notif, idx) => {
    const config = typeConfig[notif.type];
    const isLast = idx === grouped[dateLabel].length - 1;
    return <div
      key={notif.id}
      className={`group flex items-start gap-4 px-5 py-4 transition-colors cursor-pointer ${!notif.isRead ? "bg-blue-50/40 hover:bg-blue-50/70" : "hover:bg-slate-50"} ${!isLast ? "border-b border-slate-50" : ""}`}
      onClick={() => handleNotificationClick(notif)}
    >
                      {
      /* Icon */
    }
                      <div
      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${config.bg} ${config.color}`}
    >
                        {config.icon}
                      </div>

                      {
      /* Content */
    }
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
                          {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                        </div>
                        <p
      className={`text-sm leading-snug mb-1 ${!notif.isRead ? "font-semibold text-slate-900" : "font-medium text-slate-600"}`}
    >
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-400">{notif.time}</p>
                      </div>

                      {
      /* Actions */
    }
                      <div
      className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
                        {!notif.isRead && <button
      onClick={() => markRead(notif.id)}
      className="p-1.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-100 transition-colors"
      title="읽음 표시"
    >
                            <Check size={14} />
                          </button>}
                        <button
      onClick={() => deleteNotification(notif.id)}
      className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
      title="삭제"
    >
                          <Trash2 size={14} />
                        </button>
                        {notif.link && <ChevronRight size={16} className="text-slate-300 ml-1" />}
                      </div>
                    </div>;
  })}
              </div>)}
          </div>}
      </div>

      {
    /* Footer hint */
  }
      <div className="flex items-center justify-between px-1 mt-3">
        <p className="text-xs text-slate-400">
          알림은 최대 30일간 보관됩니다.
        </p>
        <button
    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
    onClick={() => navigate("/mypage")}
  >
          <Settings size={12} />
          알림 설정
        </button>
      </div>
    </div>;
}
