import React, { useEffect, useState } from "react";

const keywords = [
  "Healesville",
  "Community",
  "Unexpected",
  "Resilience",
  "Reconsideration",
  "Future",
  "Herald",
  "Progress",
  "Hope",
  "Sustainability",
];

const KeywordBackground: React.FC = () => {
  const [visibleKeyword1, setVisibleKeyword1] = useState<string | null>(null);
  const [visibleKeyword2, setVisibleKeyword2] = useState<string | null>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const randomKeyword1 =
        keywords[Math.floor(Math.random() * keywords.length)];
      setVisibleKeyword1(randomKeyword1);

      setTimeout(() => {
        setVisibleKeyword1(null);
      }, 5000);
    }, 8000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const intervalId = setInterval(() => {
        const randomKeyword2 =
          keywords[Math.floor(Math.random() * keywords.length)];
        setVisibleKeyword2(randomKeyword2);

        setTimeout(() => {
          setVisibleKeyword2(null);
        }, 5000);
      }, 6000);

      return () => {
        clearInterval(intervalId);
      };
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-gray-900">
      {visibleKeyword1 && (
        <div
          className="absolute text-white text-4xl font-bold animate-emerge tourney-keyword"
          style={{
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 80}%`,
          }}
        >
          <span className="relative z-10">{visibleKeyword1}</span>
          <div className="absolute inset-0 animate-fire"></div>
        </div>
      )}
      {visibleKeyword2 && (
        <div
          className="absolute text-white text-4xl font-bold animate-emerge tourney-keyword"
          style={{
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 80}%`,
          }}
        >
          <span className="relative z-10">{visibleKeyword2}</span>
          <div className="absolute inset-0 animate-fire"></div>
        </div>
      )}
    </div>
  );
};

export default KeywordBackground;