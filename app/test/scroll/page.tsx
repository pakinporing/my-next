'use client';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

const MyIntersectionObserver = () => {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1); // page = 1, offset = 0
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // ตรวจว่าโหลดต่อได้มั้ย
  const loader = useRef(null);

  const LIMIT = 50;

  const fetchItems = async (page: number) => {
    setLoading(true);
    try {
      const offset = (page - 1) * LIMIT;
      const res = await axios.get(
        `https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}&offset=${offset}`
      );

      setItems((prev) => [...prev, ...res.data.results]);

      // ถ้าไม่มี next แล้ว ไม่ต้องโหลดต่อ
      if (!res.data.next) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาด:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(page);
  }, [page]);

  useEffect(() => {
    // console.log('useEffect IntersectionObserver');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !loading && hasMore) {
            setPage((prev) => prev + 1);
          }
        },
        { threshold: 1 }
      );

      if (loader.current) observer.observe(loader.current);

      return () => {
        if (loader.current) observer.unobserve(loader.current);
      };
    } else {
      console.warn('ไม่รองรับ IntersectionObserver');
    }
  }, [loading, hasMore]);

  return (
    <div style={{ padding: 20 }}>
      <h2>📜 Infinite Scroll Pokémon</h2>
      <ul>
        {items.map((item, idx) => (
          <li key={idx} style={{ marginBottom: 10 }}>
            {`${idx + 1} ${item.name}`}
          </li>
        ))}
      </ul>

      {loading && <p>กำลังโหลด...</p>}
      {!hasMore && <p>📦 หมดแล้วจ้า</p>}

      <div ref={loader} style={{ height: 20 }}>
        {/* <h1>wdcwdwdewe</h1> */}
      </div>
    </div>
  );

  //   return (
  //     <div className="min-h-screen bg-gray-900 text-white font-sans p-4 md:p-8">
  //       <div className="max-w-2xl mx-auto">
  //         <header className="mb-6">
  //           <h1 className="text-4xl font-bold text-center text-yellow-400 mb-2">
  //             React Feed
  //           </h1>
  //           <p className="text-center text-gray-400">
  //             กำลังดึงข้อมูลจาก ({/* ⭐️ (จุดที่คุณต้องเปลี่ยน) ⭐️ */}
  //             <span className="font-mono text-xs">pokeapi.co</span>)
  //           </p>
  //         </header>

  //         <main>
  //           {/* 4.1 Grid สำหรับแสดงผล */}
  //           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
  //             {items.map((item, idx) => (
  //               <div
  //                 key={idx}
  //                 className="bg-gray-800 rounded-lg p-3 text-center shadow-lg transition-transform transform hover:scale-105"
  //               >
  //                 <img
  //                   // ⭐️ (จุดที่คุณต้องเปลี่ยน) ⭐️
  //                   // (PokeAPI ต้องไป fetch รูปเอง, แต่ API ของเราอาจจะมี 'item.imageUrl')
  //                   src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
  //                     // (PokeAPI URL มันแปลกๆ เราต้องดึง ID จาก URL)
  //                     item.url.split('/')[6]
  //                   }.png`}
  //                   alt={item.name}
  //                   className="w-20 h-20 mx-auto mb-2"
  //                 />
  //                 <p className="text-sm font-medium capitalize truncate">
  //                   {/* (PokeAPI คือ 'item.name', API ของเราคือ 'item.content') */}
  //                   {item.name}
  //                 </p>
  //                 <p className="text-xs text-gray-500">#{idx + 1}</p>
  //               </div>
  //             ))}
  //           </div>

  //           {/* 4.2 ตัว Loader ที่อยู่ล่างสุด */}
  //           <div ref={loader} className="h-20 flex justify-center items-center">
  //             {loading && (
  //               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
  //             )}
  //             {!hasMore && !loading && (
  //               <p className="text-gray-500">🏁 โหลดข้อมูลทั้งหมดแล้ว</p>
  //             )}
  //           </div>
  //         </main>
  //       </div>
  //     </div>
  //   );
};

export default MyIntersectionObserver;
