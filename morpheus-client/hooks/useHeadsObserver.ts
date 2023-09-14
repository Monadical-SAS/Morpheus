import { useEffect, useState, useRef } from "react";

function useHeadsObserver() {
  const observer = useRef<IntersectionObserver | null>(null);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: "-20% 0% -35% 0px",
    });

    const elements = document.querySelectorAll("h1, h2, h3, h4");
    elements.forEach((elem) => {
      if (observer.current) {
        observer.current.observe(elem);
      }
    });

    return () => observer.current?.disconnect();
  }, []);

  return { activeId };
}

export default useHeadsObserver;