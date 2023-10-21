import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import expon
from scipy.stats import chi2


LAMBDA_VALUES = [0.5, 1.0, 1.5, 2.0, 2.5]
SAMPLES_NUMBER = 10000
ALPHA = 0.05
BINS_NUMBER = 50


def test_chi_squared(random_numbers, bins_number, alpha, lam, x_max=10):
    observed_frequencies = np.histogram(
        random_numbers, bins=bins_number, density=True
    )[0]
    x = np.linspace(0, x_max, 50)
    expected_frequency = expon.pdf(x, scale=1/lam)
    chi_squared_statistic = np.sum(
        (observed_frequencies - expected_frequency) ** 2 / expected_frequency
    )
    degrees_of_freedom = bins_number - 1
    chi_squared_critical = chi2.ppf(1 - alpha, degrees_of_freedom)

    return chi_squared_statistic, chi_squared_critical


for lam in LAMBDA_VALUES:
    # Генерація випадкових чисел Xi(i) з рівномірним розподілом на інтервалі (0, 1),
    random_numbers = np.random.rand(SAMPLES_NUMBER)
    print(random_numbers)

    # Застосування формули для отримання випадкових чисел з експоненційним розподілом,
    random_exp_numbers = - (1 / lam) * np.log(random_numbers)

    # Побудова гістограми
    plt.hist(random_exp_numbers, bins=BINS_NUMBER,
             density=True, alpha=0.6, label=f'λ = {lam}')

    # Теоретичний розподіл експоненційного закону,
    x_max = np.max(random_exp_numbers)
    x = np.linspace(0, x_max, 50)
    theoretical_pdf = expon.pdf(x, scale=1/lam)
    plt.plot(x, theoretical_pdf, 'r-', label='Теоретичний PDF')

    # Знаходження середнього і дисперсії,
    mean = np.mean(random_exp_numbers)
    variance = np.var(random_exp_numbers)
    chi_squared_statistic, chi_squared_critical = test_chi_squared(
        random_exp_numbers, BINS_NUMBER, ALPHA, lam, x_max
    )
    print(f'Для λ = {lam}:'),
    print(f'Середнє: {mean}'),
    print(f'Дисперсія: {variance}'),
    print(f'Статистика Chi-squared: {chi_squared_statistic}'),
    print(f'Критичне значення Chi-squared: {chi_squared_critical}'),

    # Порівняння результатів тесту з критичним значенням,
    if chi_squared_statistic <= chi_squared_critical:
        print('Нульову гіпотезу не відхиляємо (розподіл відповідає)'),
    else:
        print('Нульову гіпотезу відхиляємо (розподіл не відповідає)'),
    print()

    plt.legend()
    plt.title(f'Гістограма розподілу для λ = {lam}')
    plt.xlabel('Значення')
    plt.ylabel('Частота')
    plt.show()
