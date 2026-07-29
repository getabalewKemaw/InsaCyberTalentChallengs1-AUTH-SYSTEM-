export interface PasswordStrengthMeterProps {
  password?: string;
}
export function PasswordStrengthMeter({ password = "" }: PasswordStrengthMeterProps) {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const checks = [
    { label: "At least 8 characters", met: hasMinLength },
    { label: "One uppercase letter (A-Z)", met: hasUppercase },
    { label: "One lowercase letter (a-z)", met: hasLowercase },
    { label: "One number (0-9)", met: hasNumber },
    { label: "One special character (!@#$)", met: hasSpecial },
  ];

  const score = checks.filter((c) => c.met).length;
  const getStrengthLabel = () => {
    if (!password) return { text: "Enter password", color: "bg-gray-200", textColor: "text-gray-500" };
    if (score <= 2) return { text: "Weak", color: "bg-red-500", textColor: "text-red-600" };
    if (score <= 4) return { text: "Medium", color: "bg-amber-500", textColor: "text-amber-600" };
    return { text: "Strong", color: "bg-[#BFB35A]", textColor: "text-[#554236]" };
  };
  const strength = getStrengthLabel();
  return (
    <div className="flex flex-col gap-2 mt-1 p-3 bg-[#FBF9F6] border border-[#E8E2D9] rounded-lg">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-[#594F4F]">Password Strength:</span>
        <span className={`${strength.textColor} font-bold uppercase tracking-wider`}>
          {strength.text}
        </span>
      </div>
      <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-full rounded-full transition-all duration-300 ${score >= level ? strength.color : "bg-gray-200"
              }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] mt-1">
        {checks.map((check, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 transition-colors ${check.met ? "text-emerald-700 font-medium" : "text-[#594F4F]/60"
              }`}
          >
            <span>{check.met ? "✓" : "○"}</span>
            <span>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
