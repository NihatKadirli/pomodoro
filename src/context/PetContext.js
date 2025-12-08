import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PET_TYPES, PET_LEVELS } from '../constants/petTypes';
import { calculateLevel, calculateSessionRewards, calculateProgress } from '../utils/petCalculations';
import { getAllSessions } from '../utils/storage';

const PetContext = createContext();

export const usePet = () => {
    const context = useContext(PetContext);
    if (!context) {
        throw new Error('usePet must be used within a PetProvider');
    }
    return context;
};

// Varsayılan Pet Verisi
const INITIAL_PET_STATE = {
    activePetId: 'cat',
    pets: {
        cat: {
            unlocked: true,
            xp: 0,
            level: 0,
            happiness: 50,
            health: 100,
            totalFocusMinutes: 0,
            lastInteracted: new Date().toISOString(),
            name: 'Kedi',
        },
        dog: { unlocked: false },
        dragon: { unlocked: false },
        robot: { unlocked: false },
        unicorn: { unlocked: false },
    },
    inventory: {
        food: 5,
        love: 5,
    },
    lastDailyReset: new Date().toDateString()
};

export const PetProvider = ({ children }) => {
    const [petState, setPetState] = useState(INITIAL_PET_STATE);
    const [loading, setLoading] = useState(true);

    // Verileri Yükle
    useEffect(() => {
        loadPetData();
    }, []);

    // Verileri Kaydet
    useEffect(() => {
        if (!loading) {
            savePetData();
        }
    }, [petState, loading]);

    // GÜNLÜK SIFIRLAMA KONTROLÜ
    const checkDailyReset = (state) => {
        const today = new Date().toDateString();
        if (state.lastDailyReset !== today) {
            console.log("📅 Günlük hediye yenilendi!");
            return {
                ...state,
                inventory: {
                    food: 5,
                    love: 5
                },
                lastDailyReset: today
            };
        }
        return state;
    };

    const loadPetData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@pomodoro_pet_state');
            let loadedState = jsonValue != null ? JSON.parse(jsonValue) : INITIAL_PET_STATE;
            loadedState = checkDailyReset(loadedState);

            // Sync Logic
            const allSessions = await getAllSessions();
            const realTotalMinutes = allSessions.reduce((sum, session) => sum + session.duration, 0);

            const activePetKey = loadedState.activePetId;
            const currentPetMinutes = loadedState.pets[activePetKey]?.totalFocusMinutes || 0;

            if (realTotalMinutes > currentPetMinutes) {
                console.log('🔄 Veri Senkronizasyonu:', { real: realTotalMinutes, pet: currentPetMinutes });

                const newXp = calculateSessionRewards(realTotalMinutes, 0, false, 1.0).totalXp;

                loadedState = {
                    ...loadedState,
                    pets: {
                        ...loadedState.pets,
                        [activePetKey]: {
                            ...loadedState.pets[activePetKey],
                            totalFocusMinutes: realTotalMinutes,
                            xp: newXp,
                            level: calculateLevel(newXp).level
                        }
                    }
                };

                Object.values(PET_TYPES).forEach(type => {
                    const petKey = type.id;
                    if (!loadedState.pets[petKey]?.unlocked && realTotalMinutes >= type.unlockMinutes) {
                        loadedState.pets[petKey] = {
                            ...loadedState.pets[petKey],
                            unlocked: true,
                            xp: 0,
                            level: 0,
                            happiness: 50,
                            health: 100,
                            totalFocusMinutes: 0,
                            name: type.name
                        };
                    }
                });
            }

            setPetState(loadedState);

        } catch (e) {
            console.error('Pet datası yüklenemedi', e);
        } finally {
            setLoading(false);
        }
    };

    const savePetData = async () => {
        try {
            await AsyncStorage.setItem('@pomodoro_pet_state', JSON.stringify(petState));
        } catch (e) {
            console.error('Pet datası kaydedilemedi', e);
        }
    };

    // --- Actions ---

    const getActivePet = () => {
        const id = petState.activePetId;
        const data = petState.pets[id];
        const typeInfo = PET_TYPES[id.toUpperCase()];
        const levelInfo = calculateLevel(data.xp);
        const progressInfo = calculateProgress(data.xp);

        return {
            ...data,
            ...typeInfo,
            currentLevelTitle: levelInfo.title,
            scale: levelInfo.scale,
            nextLevelXp: progressInfo.nextLevelXp,
            levelProgress: progressInfo.progress,
            id
        };
    };

    const addSessionReward = (minutes, distractions) => {
        const activePet = getActivePet();
        const rewards = calculateSessionRewards(
            minutes,
            distractions,
            false,
            activePet.traits.xpMultiplier
        );

        setPetState(prev => {
            const currentPet = prev.pets[prev.activePetId];
            const newXp = (currentPet.xp || 0) + rewards.totalXp;
            const newHappiness = Math.min(100, (currentPet.happiness || 50) + rewards.happinessGained);
            const newTotalMinutes = (currentPet.totalFocusMinutes || 0) + minutes;

            const updatedActivePet = {
                ...currentPet,
                xp: newXp,
                level: calculateLevel(newXp).level,
                happiness: newHappiness,
                totalFocusMinutes: newTotalMinutes,
            };

            const updatedPets = {
                ...prev.pets,
                [prev.activePetId]: updatedActivePet
            };

            Object.values(PET_TYPES).forEach(type => {
                const petKey = type.id;
                if (!updatedPets[petKey]?.unlocked && newTotalMinutes >= type.unlockMinutes) {
                    updatedPets[petKey] = {
                        ...updatedPets[petKey],
                        unlocked: true,
                        xp: 0,
                        level: 0,
                        happiness: 50,
                        health: 100,
                        totalFocusMinutes: 0,
                        name: type.name
                    };
                }
            });

            return {
                ...prev,
                pets: updatedPets,
                inventory: {
                    food: (prev.inventory?.food || 0) + minutes,
                    love: (prev.inventory?.love || 0) + minutes
                }
            };
        });

        return rewards;
    };

    // Dikkat Dağınıklığı Cezası (YENİ)
    const applyDistractionPenalty = () => {
        setPetState(prev => {
            const currentPet = prev.pets[prev.activePetId];
            // Mutluluk ve Sağlık 10 azalır (min 0)
            const newHappiness = Math.max(0, (currentPet.happiness || 50) - 10);
            const newHealth = Math.max(0, (currentPet.health || 100) - 10);

            console.log(`⚠️ Dikkat dağınıklığı cezası: Mutluluk ${currentPet.happiness}->${newHappiness}, Sağlık ${currentPet.health}->${newHealth}`);

            return {
                ...prev,
                pets: {
                    ...prev.pets,
                    [prev.activePetId]: {
                        ...currentPet,
                        happiness: newHappiness,
                        health: newHealth
                    }
                }
            };
        });
    };

    const feedPet = () => {
        if ((petState.inventory.food || 0) > 0) {
            setPetState(prev => ({
                ...prev,
                inventory: { ...prev.inventory, food: prev.inventory.food - 1 },
                pets: {
                    ...prev.pets,
                    [prev.activePetId]: {
                        ...prev.pets[prev.activePetId],
                        happiness: Math.min(100, (prev.pets[prev.activePetId].happiness || 50) + 10),
                        health: Math.min(100, (prev.pets[prev.activePetId].health || 100) + 5),
                    }
                }
            }));
            return true;
        }
        return false;
    };

    const patPet = () => {
        if ((petState.inventory.love || 0) > 0) {
            setPetState(prev => ({
                ...prev,
                inventory: { ...prev.inventory, love: prev.inventory.love - 1 },
                pets: {
                    ...prev.pets,
                    [prev.activePetId]: {
                        ...prev.pets[prev.activePetId],
                        happiness: Math.min(100, (prev.pets[prev.activePetId].happiness || 50) + 10),
                    }
                }
            }));
            return true;
        }
        return false;
    };

    const changeActivePet = (petId) => {
        if (petState.pets[petId]?.unlocked) {
            setPetState(prev => ({ ...prev, activePetId: petId }));
        }
    };

    return (
        <PetContext.Provider value={{
            petState,
            loading,
            activePet: getActivePet(),
            addSessionReward,
            applyDistractionPenalty, // YENİ
            feedPet,
            patPet,
            changeActivePet
        }}>
            {children}
        </PetContext.Provider>
    );
};
