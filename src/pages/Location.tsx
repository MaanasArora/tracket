import { useParams } from "react-router-dom";
import logo from "../assets/logo.webp";
import { useEffect, useState } from "react";
import { getLocation, getLocationNoiseData } from "../api/base";
import { MapContainer, TileLayer, Circle } from "react-leaflet";
import dayjs from "dayjs";
import { LineChart, Line, XAxis, YAxis, Legend, ReferenceArea } from "recharts";

const Appbar = () => (
  <div className="bg-dark p-2">
    <img src={logo} alt="logo" className="h-7" />
  </div>
);

interface Location {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  radius: number;
}

const LocationDetails = ({ location }: { location: Location }) => (
  <div className="w-2/5 h-full shadow-xl flex flex-col">
    <div className="p-5">
      <h3 className="mt-2 text-lg font-semibold">LOCATION</h3>
      <h1 className="mt-2 text-4xl font-semibold">{location.label}</h1>
    </div>
    <div className="mt-2 grow">
      <MapContainer
        center={[location.latitude, location.longitude]}
        zoom={17}
        scrollWheelZoom={false}
        dragging={false}
        className="h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle
          radius={location.radius}
          center={[location.latitude, location.longitude]}
        />
      </MapContainer>
    </div>
  </div>
);

const DataView = ({ data }: { data: any }) => {
  const [lastMeasurement, setLastMeasurement] = useState(null);
  const [biweeklyMeans, setBiweeklyMeans] = useState<any | null>(null);
  const [dailyPatterns, setDailyPatterns] = useState<any[] | null>(null);
  const [dailyPatternsTicks, setDailyPatternsTicks] = useState<any[] | null>(
    null
  );

  useEffect(() => {
    if (data.length > 0) {
      let _lastMeasurement = data[data.length - 1];
      const secondLastMeasurement = data[data.length - 2];

      _lastMeasurement.change =
        _lastMeasurement.mean - secondLastMeasurement.mean;
      setLastMeasurement(_lastMeasurement);
    }

    const biweeklyData = data.filter(
      (measurement: any) => dayjs().diff(measurement.timestamp, "day") <= 14
    );
    const biweeklySum = biweeklyData.reduce(
      (acc: number, measurement: any) => acc + measurement.mean,
      0
    );

    let morningHours = [23, 0, 1, 2, 3, 4, 5, 6];
    let dayHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    let eveningHours = [19, 20, 21, 22];

    const morningData = biweeklyData.filter((measurement: any) =>
      morningHours.includes(dayjs(measurement.timestamp).hour())
    );
    const dayData = biweeklyData.filter((measurement: any) =>
      dayHours.includes(dayjs(measurement.timestamp).hour())
    );
    const eveningData = biweeklyData.filter((measurement: any) =>
      eveningHours.includes(dayjs(measurement.timestamp).hour())
    );

    const morningSum = morningData.reduce(
      (acc: number, measurement: any) => acc + measurement.mean,
      0
    );
    const daySum = dayData.reduce(
      (acc: number, measurement: any) => acc + measurement.mean,
      0
    );
    const eveningSum = eveningData.reduce(
      (acc: number, measurement: any) => acc + measurement.mean,
      0
    );

    setBiweeklyMeans({
      all: biweeklySum / biweeklyData.length,
      morning: morningSum / morningData.length,
      day: daySum / dayData.length,
      evening: eveningSum / eveningData.length,
    });

    let _dailyPatterns = [];
    for (let i = 0; i < 24; i++) {
      const hourData = data.filter(
        (measurement: any) => dayjs(measurement.timestamp).hour() === i
      );
      _dailyPatterns.push(hourData.map((measurement: any) => measurement.mean));
    }
    _dailyPatterns = _dailyPatterns.map((hourData: number[], hour: number) => ({
      hour,
      value: hourData.reduce((acc, value) => acc + value, 0) / hourData.length,
    }));

    const zeroHour = _dailyPatterns[0];
    _dailyPatterns.push({
      hour: 24,
      value: zeroHour.value,
    });

    setDailyPatterns(_dailyPatterns);

    const minDailyPatterns = Math.min(
      ..._dailyPatterns.map((hourData) => hourData.value)
    );
    const maxDailyPatterns = Math.max(
      ..._dailyPatterns.map((hourData) => hourData.value)
    );

    setDailyPatternsTicks(
      [
        minDailyPatterns,
        (minDailyPatterns + maxDailyPatterns) / 2,
        maxDailyPatterns,
      ].map((value) => value.toPrecision(3))
    );
  }, [data]);

  if (!lastMeasurement || !biweeklyMeans || !dailyPatterns) {
    return <div className="p-5">Loading...</div>;
  }

  return (
    <div className="w-3/5 h-full overflow-scroll">
      <div className="flex p-3 border-b border-gray-400">
        <div className="p-5 w-1/4">
          <h3 className="text-lg font-semibold">LAST MEASUREMENT</h3>
          <p className="text-md">
            updated at
            <br />
            {dayjs(lastMeasurement.timestamp).format("DD/MM/YYYY HH:mm:ss")}
          </p>
        </div>
        <div className="p-5">
          <div className="flex flex-row justify-between">
            <div>
              <div className="flex items-center">
                <div>
                  <h2 className="text-5xl text-primary-600 font-semibold h-12 flex items-center">
                    {lastMeasurement.mean.toFixed(1)} dB
                  </h2>
                  <p className="text-md">noise for last hour</p>
                </div>
                <div className="ml-5">
                  <h4 className="text-2xl font-semibold h-12 flex items-center">
                    {lastMeasurement.change == 0
                      ? "- "
                      : lastMeasurement.change > 0
                      ? "\u25B2 "
                      : "\u25BC "}
                    {lastMeasurement.change.toFixed(1)} dB
                  </h4>
                  <p className="text-md">change from previous hour</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex p-3 border-gray-400">
        <div className="p-5 w-1/4">
          <h3 className="text-lg font-semibold">DAILY PATTERNS</h3>
          <p className="text-md">last two weeks</p>
        </div>
        <div className="p-5 w-3/4">
          <div className="flex flex-row">
            <div>
              <LineChart width={550} height={120} data={dailyPatterns}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  dot={false}
                />
                <XAxis dataKey="hour" fontSize={12} />
                <YAxis
                  fontSize={12}
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  ticks={dailyPatternsTicks}
                  padding={{ top: 10, bottom: 10 }}
                  width={30}
                />
              </LineChart>
            </div>
          </div>
          <div className="flex flex-row mt-5 mb-5 items-center">
            <p className="text-md w-48">general average</p>
            <p className="text-xl font-semibold ml-5">
              {biweeklyMeans.all.toFixed(1)} dB
            </p>
          </div>
          <p>23:00 - 07:00</p>
          <div className="flex flex-row mb-5 items-center">
            <p className="text-md w-48">morning average</p>
            <p className="text-xl font-semibold ml-5">
              {biweeklyMeans.morning.toFixed(1)} dB
            </p>
          </div>
          <p>07:00 - 19:00</p>
          <div>
            <div className="flex flex-row mb-5 items-center">
              <p className="text-md w-48">day average</p>
              <p className="text-xl font-semibold ml-5">
                {biweeklyMeans.day.toFixed(1)} dB
              </p>
            </div>
          </div>
          <p>19:00 - 23:00</p>
          <div className="flex flex-row mb-5 items-center">
            <p className="text-md w-48">evening average</p>
            <p className="text-xl font-semibold ml-5">
              {biweeklyMeans.evening.toFixed(1)} dB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Location = () => {
  const { id } = useParams();

  const [location, setLocation] = useState<Location | null>(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!id) return;

    getLocation(id).then((data) => {
      setLocation(data);
    });

    getLocationNoiseData(id).then((data) => {
      setData(data);
    });
  }, [id]);

  return (
    <div className="flex flex-col h-screen">
      <Appbar />
      {location && (
        <div className="flex flex-row h-full">
          <LocationDetails location={location} />
          {data ? (
            <DataView data={data} />
          ) : (
            <div className="p-5">Loading...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Location;
