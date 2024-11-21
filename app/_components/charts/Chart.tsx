'use client'

import useResizeObserver from '@react-hook/resize-observer'
import * as echarts from 'echarts';
import { useEffect, useRef, useState } from "react";
import { NoSsr } from '../NoSsr';

export default function Chart({
  option,
  loading,
  style,
}: {
  option: any,
  loading?: boolean,
  style?: any
}) {
  return (
    <NoSsr>
      <ChartNoSsr option={option} loading={loading} style={style} />
    </NoSsr>
  )
}

function ChartNoSsr({
  option,
  loading,
  style,
}: {
  option: any,
  loading?: boolean,
  style?: any
}) {
  const [chart, setChart] = useState<any>()
  const chartRef = useRef<any>();
  // console.log("components.charts.Chart", { chartRef });

  useResizeObserver(chartRef.current, () => chart && chart.resize());

  useEffect(() => {
    // console.log("components.charts.Chart useEffect", { option });

    let c = chart;
    if (!c) {
      c = echarts.init(chartRef.current);
      setChart(c);
    }

    c.setOption(option, true);

    if (loading) {
      c.showLoading();
    } else {
      c.hideLoading();
    }
  }, [option, loading, chart]);

  return (
    <div
      className="Chart"
      ref={chartRef}
      style={style || {}}
    />
  );
}
