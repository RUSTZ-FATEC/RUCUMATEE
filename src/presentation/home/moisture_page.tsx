import React, { useEffect, useState, useRef } from 'react';
import Logo from '../../assets/images/logo.svg';
import * as echarts from 'echarts';

export const MoistureComponent: React.FC = () => {

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const chartRef = useRef(null);

    interface ItemData {
        id: number;
        user_id: string;
        temperature: string;
        humidity: string;
    }

    const [slides, setSlides] = useState<ItemData[]>([]);
    const user_id = window.localStorage.getItem("user_id");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `https://rucumate.herokuapp.com/esp/data/id/user/${user_id}`
                );
                const data = await response.json();
                setSlides(data);
            } catch (error) {
                console.log("Error fetching data:", error);
            }

            // Gráfico
            try {
                const endpoint = window.location.href;
                let seriesData = [];
                const user_id = localStorage.getItem('user_id'); // Obter o user_id armazenado localmente

                if (endpoint.endsWith('temperatura')) {
                    const response = await fetch(`https://rucumate.herokuapp.com/esp/data/id/user/${user_id}`);
                    const data = await response.json();
                    seriesData = data.map((entry: any) => entry.temperature);
                } else if (endpoint.endsWith('umidade')) {
                    const response = await fetch(`https://rucumate.herokuapp.com/esp/data/id/user/${user_id}`);
                    const data = await response.json();
                    seriesData = data.map((entry: any) => entry.humidity);
                }

                if (chartRef.current) {
                    const chart = echarts.init(chartRef.current);

                    const xAxisData: [] = []; // Defina os dados apropriados para o eixo x

                    const option: any = {
                        xAxis: {
                            type: 'category',
                            data: xAxisData,
                        },
                        yAxis: {
                            type: 'value',
                        },
                        series: [
                            {
                                data: seriesData,
                                type: 'bar',
                                showBackground: true,
                                backgroundStyle: {
                                    color: 'rgba(180, 180, 180, 0.2)',
                                },
                                itemStyle: {
                                    color: '#D6E1E0',
                                },
                            },
                            {
                                name: 'Linha Pontilhada',
                                type: 'line',
                                symbol: 'none',
                                lineStyle: {
                                    type: 'dashed',
                                    color: 'red',
                                },
                                markLine: {
                                    data: [
                                        { yAxis: 20, lineStyle: { color: 'red' } }, // Valor mínimo (inferior)
                                        { yAxis: 60, lineStyle: { color: 'red' } }, // Valor máximo (superior)
                                    ],
                                },
                            },
                        ],
                        tooltip: {
                            trigger: 'axis',
                        },
                    };

                    // Verificar se é temperatura e ajustar os valores da linha pontilhada
                    if (endpoint.endsWith('temperatura')) {
                        option.series[1].markLine.data = [
                            { yAxis: 16, lineStyle: { color: 'red' } }, // Valor mínimo (inferior)
                            { yAxis: 34, lineStyle: { color: 'red' } }, // Valor máximo (superior)
                        ];
                    }

                    chart.setOption(option);

                    const resizeHandler = () => {
                        chart.resize();
                    };

                    window.addEventListener('resize', resizeHandler);

                    return () => {
                        window.removeEventListener('resize', resizeHandler);
                        chart.dispose();
                    };
                }
            } catch (error) {
                console.log('Error fetching data:', error);
            }
        };

        fetchData();
    }, [user_id]);

    const getModelInfo = (slide: any) => {
        if (window.location.pathname === '/temperatura') {
            return slide.temperature;
        } else if (window.location.pathname === '/umidade') {
            return slide.humidity;
        } else {
            return "Modelo não especificado";
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <header className="bg-[#1D1D1D]">
                <nav className="flex items-center justify-between mx-auto max-w-7xl p-3">
                    <div className="flex lg:flex-1">
                        <a href="#">
                            <img className="h-8 w-auto" src={Logo} alt="..." />
                        </a>
                    </div>
                    <div className="flex lg:hidden">
                        <button type="button" onClick={toggleMenu}>
                            {isMenuOpen ? (
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                                    stroke="white" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                                    stroke="white" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>

                            )}
                        </button>
                    </div>
                    <div className={`hidden lg:flex lg:gap-x-6 ${isMenuOpen ? 'block' : 'hidden'}`}>
                        <a href='/umidade' className="font-semibold text-white cursor-pointer border-b-2 border-transparent transition-all duration-150 hover:border-[#00960A]">Úmidade</a>
                        <a href='/temperatura' className="font-semibold text-white cursor-pointer border-b-2 border-transparent transition-all duration-150 hover:border-[#00960A]">Temperatura</a>
                        <a href='/notificacao' className="font-semibold text-white cursor-pointer border-b-2 border-transparent transition-all duration-150 hover:border-[#00960A]">Notificações</a>
                    </div>
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                        <button type='button' onClick={() => {
                            window.localStorage.clear();
                            window.location.href = "/";
                        }}>
                            <svg width="25" height="23" viewBox="0 0 25 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.375 0V3.24675H21.875V19.4805H9.375V22.7273H25V0H9.375ZM6.25 6.49351L0 11.3636L6.25 16.2338V12.987H18.75V9.74026H6.25V6.49351Z" fill='#FFFFFF' />
                            </svg>
                        </button>
                    </div>
                </nav>
                <div className={`${isMenuOpen ? 'block' : 'hidden'} lg:hidden`}>
                    <div className="w-full bg-[#1D1D1D] px-6">
                        <div className="divide-y divide-white">
                            <div className="py-6">
                                <a href='/umidade' className="block rounded-lg px-3 py-2 font-semibold text-white cursor-pointer transition-all duration-150 hover:bg-[#404041]">Úmidade</a>
                                <a href='/temperatura' className="block rounded-lg px-3 py-2 font-semibold text-white cursor-pointer transition-all duration-150 hover:bg-[#404041]">Temperatura</a>
                                <a href='/notificacao' className="block rounded-lg px-3 py-2 font-semibold text-white cursor-pointer transition-all duration-150 hover:bg-[#404041]">Notificações</a>
                            </div>
                            <div className="py-6">
                                <button type='button' onClick={() => {
                                    window.localStorage.clear();
                                    window.location.href = "/";
                                }} className="px-3 py-2">
                                    <svg width="25" height="23" viewBox="0 0 25 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9.375 0V3.24675H21.875V19.4805H9.375V22.7273H25V0H9.375ZM6.25 6.49351L0 11.3636L6.25 16.2338V12.987H18.75V9.74026H6.25V6.49351Z" fill='#FFFFFF' />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <div className='flex flex-col items-center justify-center mx-auto w-full max-w-3xl h-screen'>
                <div ref={chartRef} style={{ width: '100%', maxWidth: '700px', height: '400px' }} />
                <div className='w-full h-28 overflow-auto'>
                    {slides.map((slide: ItemData) => (
                        <div className='flex flex-col bg-[#1D1D1D] text-white rounded-lg p-2.5 m-2.5'>
                            <span>ID: {slide.id}</span>
                            <span>Usuário {slide.user_id}</span>
                            <span>Modelo: {getModelInfo(slide)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}