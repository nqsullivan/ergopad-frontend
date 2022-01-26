import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryLegend,
  VictoryStack,
} from 'victory';

const StackedAreaPortfolioHistory = (props) => {
  return (
    <VictoryChart>
      <VictoryLegend
        gutter={20}
        orientation="horizontal"
        colorScale="cool"
        itemsPerRow={3}
        x={80}
        y={-40}
        data={props.data.map((priceHistory, index) => {
          return {
            id: index,
            name: priceHistory.token,
          };
        })}
        style={{ labels: { fill: 'white' } }}
        name="legend"
      />
      <VictoryStack
        colorScale="cool"
        animate={{ easing: 'exp' }}
        style={{ labels: { fill: 'white' } }}
      >
        {props.data.map((priceHistory) => (
          <VictoryArea
            name={priceHistory.token}
            key={priceHistory.token}
            data={priceHistory.history.map((dataPoint) => {
              return {
                x: dataPoint.timestamp,
                y: dataPoint.value,
              };
            })}
          />
        ))}
      </VictoryStack>
      <VictoryAxis
        dependentAxis
        tickFormat={(value) => {
          const valueTh = value / 1000;
          const formatted = '$' + Math.floor(valueTh * 100) / 100 + 'k';
          return formatted;
        }}
        style={{
          axis: { stroke: 'white' },
          ticks: { stroke: 'white' },
          tickLabels: { fill: 'white', fontSize: 8 },
        }}
      />
      <VictoryAxis
        crossAxis
        invertAxis
        tickFormat={(timestamp) => {
          return new Date(Date.parse(timestamp)).toDateString();
        }}
        style={{
          axis: { stroke: 'white' },
          ticks: { stroke: 'white' },
          tickLabels: { fill: 'white', fontSize: 7 },
        }}
      />
    </VictoryChart>
  );
};

export default StackedAreaPortfolioHistory;
