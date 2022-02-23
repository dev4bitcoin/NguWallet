import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import {
    LineChart
} from "react-native-chart-kit";

const chartConfig = {
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    propsForDots: {
        r: "0",
        strokeWidth: "1",
        //stroke: "#f2a900",
    },
    linejoinType: 'round',
    scrollableDotFill: '#1b222c',
    scrollableDotRadius: 6,
    scrollableDotStrokeColor: '#fff',
    scrollableDotStrokeWidth: 3,
    scrollableInfoViewStyle: {
        justifyContent: 'center',
        alignContent: 'center',
        //backgroundColor: '#12171e',
        borderRadius: 2,
        marginTop: 25,
        marginLeft: 25,
    },
    scrollableInfoTextStyle: {
        fontSize: 12,
        color: '#C4C4C4',
        //marginHorizontal: 0,
        //flex: 2,
        //textAlign: 'center',
        marginLeft: 60
    },
    scrollableInfoSize: {
        width: 140,
        height: 30,
    },
    scrollableInfoOffset: 15,
};

function Chart({ data }) {
    const { width, height } = Dimensions.get("window");

    const wp = (number) => {
        let givenWidth = typeof number === "number" ? number : parseFloat(number);
        return PixelRatio.roundToNearestPixel((width * givenWidth) / 100);
    };

    return (
        <View style={styles.container}>
            <LineChart
                data={{
                    datasets: [
                        {
                            data: data
                        }
                    ]
                }}
                width={wp("100%")} // from react-native
                height={250}
                hideLegend={false}
                withVerticalLabels={false}
                withOuterLines={false}
                withInnerLines={false}
                withHorizontalLabels={false}
                chartConfig={chartConfig}
                withDots={true}
                withScrollableDot={true}
                withShadow={true}
                bezier
                style={{
                    borderRadius: 2,
                    paddingLeft: 0,
                    paddingRight: 0,
                    marginRight: 0,
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 260,
        paddingTop: 30
    },
});

export default Chart;