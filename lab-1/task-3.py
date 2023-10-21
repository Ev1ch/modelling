import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import chi2
from scipy.stats import uniform


SAMPLES_NUMBER = 10000
A_VALUES = [5**13, 5**5, 2**20]
C_VALUES = [2**31, 2**13, 5**20]
BINS_NUMBER = 50
ALPHA = 0.05


def get_random_numbers(a, c, samples_number):
    z = np.zeros(samples_number)
    x = np.zeros(samples_number)
    z[0] = 42  # Початкове значення z₀ (можна вибрати інше)

    for i in range(1, samples_number):
        z[i] = (a * z[i-1]) % c
        x[i] = (z[i] + c) / c

    return x


def test_chi_squared(random_numbers, bins_number, alpha):
    observed_frequencies = np.histogram(
        random_numbers, bins=bins_number, density=True)[0]
    expected_frequency = uniform.pdf(np.linspace(0, 1, bins_number))
    chi_squared_statistic = np.sum(
        (observed_frequencies - expected_frequency) ** 2 / expected_frequency)

    degrees_of_freedom = bins_number - 1
    chi_squared_critical = chi2.ppf(1 - alpha, degrees_of_freedom)

    return chi_squared_statistic, chi_squared_critical


for a in A_VALUES:
    for c in C_VALUES:
        random_numbers = get_random_numbers(a, c, SAMPLES_NUMBER)

        # Побудова гістограми частот
        plt.hist(random_numbers, bins=BINS_NUMBER, density=True,
                 alpha=0.6, color='g', label='Гістограма частот')

        # Визначення середнього і дисперсії
        mean = np.mean(random_numbers)
        variance = np.var(random_numbers)

        chi_squared_statistic, chi_squared_critical = test_chi_squared(
            random_numbers, BINS_NUMBER, ALPHA)
        uniform_pdf = uniform.pdf(np.linspace(0, 1, BINS_NUMBER))

        # Побудова графіку щільності розподілу
        plt.plot(np.linspace(1, 2, BINS_NUMBER), uniform_pdf,
                 'r-', label='Щільність розподілу')

        # Виведення результатів
        print(f'Параметри a={a}, c={c}')
        print(f'Середнє: {mean}')
        print(f'Дисперсія: {variance}')
        print(f'Статистика Chi-squared: {chi_squared_statistic}')
        print(f'Критичне значення Chi-squared: {chi_squared_critical}')

        # Порівняння результатів тесту з критичним значенням
        if chi_squared_statistic <= chi_squared_critical:
            print('Нульову гіпотезу не відхиляємо (розподіл відповідає)')
        else:
            print('Нульову гіпотезу відхиляємо (розподіл не відповідає)')
        print()

        # Показ графіку
        plt.xlim(1, 2)
        plt.legend()
        plt.xlabel('Випадкові числа')
        plt.ylabel('Частота')
        plt.title('Гістограма частот')
        plt.show()
