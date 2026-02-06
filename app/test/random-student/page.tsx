'use client';

import { useState } from 'react';

type Student = {
  id: number;
  name: string;
  power: number;
};

const data: number[] = [
  1, 2, 3, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 20, 22, 23, 24
];

const students: Student[] = [
  { id: 1, name: 'เบล', power: 80 },
  { id: 2, name: 'น้ำแข็ง', power: 50 },
  { id: 3, name: 'แบงค์', power: 50 },
  { id: 4, name: 'น้ำขิง', power: 50 },
  { id: 5, name: 'แนน', power: 50 },
  { id: 6, name: 'ยู', power: 50 },
  { id: 7, name: 'เรน', power: 50 },
  { id: 8, name: 'บิ้ก', power: 50 },
  { id: 9, name: 'รุท', power: 50 },
  { id: 10, name: 'อัพ', power: 50 },
  { id: 11, name: 'มอส', power: 50 },
  { id: 12, name: 'แนนใส่แว่น', power: 50 },
  { id: 13, name: 'โอเว่น', power: 50 },
  { id: 14, name: 'เบญ', power: 50 },
  { id: 15, name: 'เอ๋ย', power: 50 },
  { id: 16, name: 'ขุนเดช', power: 50 },
  { id: 17, name: 'ไม้', power: 50 },
  { id: 18, name: 'มาร์ค', power: 50 },
  { id: 19, name: 'ไวน์', power: 50 },
  { id: 20, name: 'อัน', power: 50 },
  { id: 21, name: 'ชุน', power: 50 },
  { id: 22, name: 'ท้อฟฟี่', power: 50 },
  { id: 23, name: 'พีท', power: 50 },
  { id: 24, name: 'บอส', power: 70 }
];

export default function RandomStudent() {
  const [numbers] = useState<number[]>(data);
  const [groups, setGroups] = useState<Student[][]>([]);
  const [mode, setMode] = useState<'random' | 'size'>('random');
  const [groupCount, setGroupCount] = useState<number>(5);
  const [groupSize, setGroupSize] = useState<number>(3);

  // เลือกนักเรียนจาก id
  const getStudentsFromIds = (numbers: number[]): Student[] =>
    numbers
      .map((id) => students.find((s) => s.id === id))
      .filter((s): s is Student => Boolean(s));

  // balance ปกติ
  const distributeBalanced = (
    list: Student[],
    groupCount: number,
    initialGroups: Student[][] | null = null
  ): Student[][] => {
    const groups =
      initialGroups || Array.from({ length: groupCount }, () => []);

    const groupPower = groups.map((g) =>
      g.reduce((sum, s) => sum + s.power, 0)
    );

    list.forEach((student) => {
      const targetIndex = groupPower.indexOf(Math.min(...groupPower));
      groups[targetIndex].push(student);
      groupPower[targetIndex] += student.power;
    });

    return groups;
  };

  // ต้องมี high power ทุกกลุ่ม
  const distributeWithHighPower = (
    students: Student[],
    groupCount: number
  ): Student[][] => {
    const sorted = [...students].sort((a, b) => b.power - a.power);

    const top = sorted.slice(0, groupCount);
    const remaining = sorted.slice(groupCount);

    const initialGroups = top.map((s) => [s]);

    return distributeBalanced(remaining, groupCount, initialGroups);
  };

  // random mode
  const groupRandomly = (
    numbers: number[],
    groupCount: number
  ): Student[][] => {
    if (groupCount <= 0) throw new Error('จำนวนกลุ่มต้องมากกว่า 0');

    const selectedStudents = getStudentsFromIds(numbers);
    const shuffled = [...selectedStudents].sort(() => Math.random() - 0.5);

    return distributeWithHighPower(shuffled, groupCount);
  };

  // by size mode
  const groupBySize = (numbers: number[], groupSize: number): Student[][] => {
    if (groupSize <= 1) throw new Error('จำนวนคนต่อกลุ่มต้องมากกว่า 1');

    const selectedStudents = getStudentsFromIds(numbers);
    const shuffled = [...selectedStudents].sort(() => Math.random() - 0.5);

    const groupCount = Math.ceil(shuffled.length / groupSize);

    return distributeWithHighPower(shuffled, groupCount);
  };

  const handleGroup = () => {
    try {
      let result: Student[][] = [];

      if (mode === 'random') {
        result = groupRandomly(numbers, groupCount);
      } else {
        result = groupBySize(numbers, groupSize);
      }

      setGroups(result);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  return (
    <div className="p-6 font-sans min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">📊 แบ่งกลุ่มนักเรียน</h2>

      <div className="flex flex-wrap gap-4 mb-4">
        <button
          onClick={() => setMode('random')}
          className={`px-4 py-2 rounded font-semibold ${
            mode === 'random' ? 'bg-blue-700 text-white' : 'bg-gray-300'
          }`}
        >
          🎲 random
        </button>

        <button
          onClick={() => setMode('size')}
          className={`px-4 py-2 rounded font-semibold ${
            mode === 'size' ? 'bg-green-700 text-white' : 'bg-gray-300'
          }`}
        >
          🧮 by size
        </button>

        <button
          onClick={handleGroup}
          className="bg-purple-600 text-white px-4 py-2 rounded font-semibold"
        >
          ✅ สุ่มจัดกลุ่ม
        </button>
      </div>

      <div className="mb-6">
        {mode === 'random' ? (
          <label className="block mb-2 font-medium">
            จำนวนกลุ่มที่ต้องการ:
          </label>
        ) : (
          <label className="block mb-2 font-medium">
            ขนาดของแต่ละกลุ่ม (จำนวนคนต่อกลุ่ม):
          </label>
        )}
        {mode === 'random' ? (
          <input
            type="number"
            value={groupCount}
            min={1}
            onChange={(e) => setGroupCount(Number(e.target.value))}
            className="border px-3 py-2 rounded w-48"
          />
        ) : (
          <input
            type="number"
            value={groupSize}
            min={2}
            onChange={(e) => setGroupSize(Number(e.target.value))}
            className="border px-3 py-2 rounded w-48"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {groups.map((group, idx) => (
          <div key={idx} className="bg-white p-4 rounded shadow">
            <h4 className="font-bold mb-2">
              กลุ่ม {idx + 1} (พลังรวม{' '}
              {group.reduce((sum, s) => sum + s.power, 0)})
            </h4>
            <ul>
              {group.map((s) => (
                <li key={s.id}>
                  {s.id}. {s.name} ({s.power})
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
