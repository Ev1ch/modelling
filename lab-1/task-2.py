import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import norm
from scipy.stats import chi2


SAMPLES_NUMBER = 10000
A_VALUES = [0, 2, 4]
OMEGA_VALUES = [1, 2, 3]
BINS_NUMBER = 30
ALPHA = 0.05


def get_mu():
    # Генерація випадкових чисел Xi(i) з рівномірним розподілом на інтервалі (0, 1)
    xi_values = np.random.rand(12)
    return np.sum(xi_values - 6)


def get_x(omega, a):
    mu = np.array([get_mu() for _ in range(SAMPLES_NUMBER)])
    return omega * mu + a


def test_chi_squared(random_numbers, bins_number, alpha):
    observed_frequencies = np.histogram(
        random_numbers, bins=bins_number, density=True)[0]
    expected_frequency = norm.pdf(np.linspace(-3, 3, bins_number))
    chi_squared_statistic = np.sum(
        (observed_frequencies - expected_frequency) ** 2 / expected_frequency)

    degrees_of_freedom = bins_number - 1
    chi_squared_critical = chi2.ppf(1 - alpha, degrees_of_freedom)

    return chi_squared_statistic, chi_squared_critical


for a in A_VALUES:
    for omega in OMEGA_VALUES:
        x_values = get_x(omega, a)

        # Обчислення середнього і дисперсії
        mean = np.mean(x_values)
        variance = np.var(x_values)

        # Обчислення нормального розподілу
        x_range = np.linspace(min(x_values), max(x_values), 100)
        normal_pdf = norm.pdf(x_range, loc=mean, scale=np.sqrt(variance))

        # Побудова гістограми
        plt.hist(x_values, bins=BINS_NUMBER, density=True,
                 alpha=0.6, label=f'omega={omega}, a={a}')
        plt.plot(x_range, normal_pdf, 'r-',
                 label=f'Normal(mu={mean:.2f}, sigma={np.sqrt(variance):.2f})')

        # Виклик функції для тесту Chi^2
        chi_squared_statistic, chi_squared_critical = test_chi_squared(
            x_values, BINS_NUMBER, ALPHA)

        print(f'omega={omega}, a={a}')
        print(f'Статистика Chi-squared: {chi_squared_statistic}')
        print(f'Критичне значення Chi-squared: {chi_squared_critical}')

        # Порівняння результатів тесту з критичним значенням
        if chi_squared_statistic <= chi_squared_critical:
            print('Нульову гіпотезу не відхиляємо (розподіл відповідає)')
        else:
            print('Нульову гіпотезу відхиляємо (розподіл не відповідає)')
        print()

        plt.legend()
        plt.title(
            f'Гістограма та нормальний розподіл для omega={omega}, a={a}')
        plt.show()
