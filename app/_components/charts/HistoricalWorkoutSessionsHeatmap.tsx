import moment from 'moment';
import Chart from './Chart';
import * as echarts from 'echarts';
import { Session } from 'inspector';
import { kvArrayToObject } from '@desmat/utils';
import { WorkoutSession, WorkoutSet } from '@/types/Workout';

export default function DailySummaryChart({
  sessions,
  loading,
}: {
  sessions: any[]
  loading?: boolean,
}) {
  console.log("app._components.charts.DailySummaryChart", { sessions });

  const summarizedSessions: any = {};
  sessions && sessions
    .forEach((session: WorkoutSession) => {
      const date = moment(session.createdAt).format("YYYY-MM-DD");
      const total = session.sets
        .reduce((total: number, s: WorkoutSet) => total + (s.duration || 0) / 1000 / 60, 0)
      console.log("components.charts.DailySummaryChart forEach", { session, date, total });
      summarizedSessions[date] = (summarizedSessions[date] || 0) + total;
    });

  console.log("components.charts.DailySummaryChart", { summarizedSessions });

  const data: any = summarizedSessions && Object.entries(summarizedSessions)
    .map((e: any) => [e[0], Math.round(e[1])]
    );

  console.log("components.charts.DailySummaryChart", { data });

  // const DayStartsAt = 6;
  const toDate = moment()
    .format("YYYY-MM-DD");
  const fromDate = moment(toDate)
    .add(-365, "days")
    .format("YYYY-MM-DD");
  const minTotal = data && data
    .reduce((min: number, val: any) => val[1] < min ? val[1] : min, Number.MAX_SAFE_INTEGER);
  const maxTotal = data && data
    .reduce((max: number, val: any) => val[1] > max ? val[1] : max, 0);

  console.log("components.charts.DailySummaryChart", { fromDate, toDate });

  const option = {
    tooltip: {
      formatter: (params: any) => `${params.data[0]}: ${params.data[1]} mins`,
    },
    visualMap: {
      show: false,
      min: minTotal,
      max: maxTotal,
    },
    calendar: {
      itemStyle: {
        color: "rgba(0, 0, 0, 0.015)",
        borderColor: "rgba(0, 0, 0, 0.03)",
      },
      top: 18,
      left: 0,
      right: 0,
      range: [fromDate, toDate],
      yearLabel: { show: false },
      splitLine: { show: false },
    },
    series: {
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data,
    }
  };

  return (
    <Chart
      loading={loading}
      option={sessions ? option : {}}
      style={{ height: 180 /* TODO max width */ }}
    />
  );
}
