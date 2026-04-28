import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  // getPersonaCurrent,
  // getPersonaHistory,
  type PersonaCurrent,
  type PersonaHistoryItem,
} from "../api/persona";

const mockCurrent: PersonaCurrent = {
  title: '"금요일 저녁의 감정적인 탐험가"',
  description:
    "당신은 주말을 앞둔 금요일 저녁 공상적인 탐험가입니다. 특히 급속철과 추억의 활용에서 기쁨이 최고조를 느끼며 저녁의 경험을 선호합니다.",
};

const mockHistory: PersonaHistoryItem[] = [
  { name: '"몽정적인 여성가"', startDate: "2026.04.01", endDate: "2026.04.14", color: "#7ab97a" },
  { name: '"강수 능숙가"', startDate: "2026.03.15", endDate: "2026.03.31", color: "#6b8ba8" },
  { name: '"노시 달려가"', startDate: "2026.02.28", endDate: "2026.03.14", color: "#a0947a" },
];

export function usePersona() {
  const [current, setCurrent] = useState<PersonaCurrent | null>(null);
  const [history, setHistory] = useState<PersonaHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // TODO: API 연동 후 아래 mock 데이터 제거하고 주석 해제
    // Promise.all([getPersonaCurrent(), getPersonaHistory()])
    //   .then(([currentData, historyData]) => {
    //     if (cancelled) return;
    //     setCurrent(currentData);
    //     setHistory(historyData);
    //   })
    //   .catch(() => {
    //     if (cancelled) return;
    //     setCurrent(null);
    //     setHistory([]);
    //   })
    //   .finally(() => {
    //     if (!cancelled) setLoading(false);
    //   });

    if (!cancelled) {
      setCurrent(mockCurrent);
      setHistory(mockHistory);
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, [location.key]);

  return { current, history, loading };
}
