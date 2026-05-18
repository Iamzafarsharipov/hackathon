name=input("Enter your name:")
monthly_income=float(input("Enter your monthly income (scholaarship+part-time job):"))
fixed_expenses=float(input("Enter your monthly average of  fixed expenses (Dorm/rent,meal etc:)"))
variable_expenses=float(input("Enter your monthly average of variable expenses (personal items,social activities etc:)"))
current_savings=float(input("Enter your current savings:"))
Emerg_fund_goal=float(input("Enter your emergency fund goal:"))
has_loan=input("Do you have any student loans? (yes/no):")   

#Calculation
total_month_exp=fixed_expenses+variable_expenses
month_net_sav= monthly_income-(fixed_expenses+variable_expenses)
sav_rat_per=100*month_net_sav/total_month_exp
exp_to_inc_rat=total_month_exp/monthly_income*100
three_month_exp=total_month_exp*3
month_need_to_reachfund=(Emerg_fund_goal-current_savings)/month_net_sav
Emerg_fund_gap=Emerg_fund_goal-current_savings
print(f"Yor monthly expenses is: {total_month_exp}$")
print(f"Your monthly savings is: {month_net_sav}$")
print(f"Your savings rate percentage is: {sav_rat_per}%")
print(f"Your expense to income rate is:{exp_to_inc_rat}%")
print(f"Your 3 months expense total is:{three_month_exp}$")
print(f"You need {month_need_to_reachfund} months to reach your goal")
print(f"You need {Emerg_fund_gap}$ to reach your fund goal")

