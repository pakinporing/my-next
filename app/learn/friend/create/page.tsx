'use client';

export default function CreateFriendPage() {
  return (
    <div>
      <form action="">
        <div>
          lorem 10
          <label htmlFor="">Name</label>
          <input type="text" className="border px-3 py-1.5" />
        </div>
        <div>
          <label htmlFor="">Score</label>
          <input type="text" className="border px-3 py-1.5" />
        </div>

        <button type="submit">Create Friend</button>
      </form>
    </div>
  );
}
