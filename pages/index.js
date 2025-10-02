export default function Home() {
  return (
    <div className="bg-black min-h-screen">
      <header className="bg-gray-800 text-white py-4">
        <h1 className="text-2xl font-bold text-center">Who Would Win</h1>
      </header>

      <div className="flex flex-col md:flex-row min-h-screen">
        <div id="LeftSide" className="flex-1 p-4 flex flex-col items-center justify-center">
          <p className="Left_text">Left side name!</p>
          <img src="https://via.placeholder.com/150" alt="Left Side" className="mt-4" />
        </div>

        <div id="RightSide" className="flex-1 p-4 flex flex-col items-center justify-center">
          <p className="Right_text">Right side name</p>
          <img src="https://via.placeholder.com/150" alt="Right Side" className="mt-4" />
        </div>
      </div>
    </div>
  );
}
