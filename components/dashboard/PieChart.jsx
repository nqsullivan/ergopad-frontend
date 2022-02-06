import { VictoryContainer, VictoryLabel, VictoryPie } from 'victory';

const toValueText = (value) => {
  if (value < 1000) {
    return `$${Math.round(value * 100) / 100} USD`;
  } else if (value < 1000000) {
    return `$${Math.round(value / 100) / 10}k USD`;
  } else {
    return `$${Math.round(value / 10000) / 100}m USD`;
  }
};

const PieChart = (props) => {
  const totalValue = props.holdingData
    .map((data) => data.y)
    .reduce((a, c) => a + c, 0);
  return (
    <svg viewBox="0 0 400 400">
      <VictoryPie
        id="victory-pie-chart"
        standalone={false}
        width={400}
        height={400}
        innerRadius={100}
        padAngle={2}
        data={props.holdingData}
        colorScale="cool"
        style={{ labels: { fill: 'white' } }}
        containerComponent={
          <VictoryContainer
            id="victory-stack-chart-container"
            style={{
              touchAction: 'auto',
            }}
          />
        }
      />
      <VictoryLabel
        textAnchor="middle"
        style={{ fontSize: 18, fill: 'white' }}
        x={200}
        y={200}
        text={toValueText(totalValue)}
      />
    </svg>
  );
};

export default PieChart;
