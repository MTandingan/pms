<script setup>
    import { computed} from 'vue';
    import { Pie } from 'vue-chartjs';
    import { Chart as ChartJS, Title, ArcElement, Tooltip, Legend } from 'chart.js';

    ChartJS.register(Title, ArcElement, Tooltip, Legend);

    const props = defineProps({
        title: {
            type: String,
            required: true
        },
        data: {
            type: Object,
            required: true
        }
    });

    const chartData = computed(() => ({
        labels: Object.keys(props.data),
        datasets: [{
            backgroundColor: ['#45B4B4', '#42A5F5', '#2279a9'],
            data: Object.values(props.data)
        }]
    }))

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 10,
                bottom: 10
            }
        },
        plugins: {            
            title: {
                display: true,
                text: `${props.title}`,
                font: {
                    size: (ctx) => {
                        return Math.min(16, ctx.chart.width / 20);
                    },
                    weight: 'bold'
                },
                color: '#333',
                padding: {
                    top: 5,
                    bottom: 5
                }
            },
            datalabels: {
                color: "#000",
                font: {
                    weight: 'bold'
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.formattedValue;
                        return `${label}: ${value}`;
                    }
                }
            }
        },
        elements: {
            arc: {
                borderWidth: 1
            }
        },
        layout: {
            padding: 10
        }
    }
</script>

<template>
    <div :style="{height: '100%'}">
        <Pie
            :data="chartData"
            :options="chartOptions"
        />
    </div>
</template>

<style scoped>
</style>