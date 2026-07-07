import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { User, Mail, Lock, Phone, MessageSquare } from "lucide-react";
import { signup } from "../../../shared/api/authApi";
import { useLocale } from "../../../shared/i18n";
import {
  authCardClassName,
  authInputClassName,
  authLabelClassName,
  authPrimaryButtonClassName,
} from "../authUi";

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className={authLabelClassName}>{label}</label>
      <div className="relative">
        <Icon
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
          aria-hidden="true"
        />
        {children}
      </div>
    </div>
  );
}

function FieldGroup({ children }) {
  return <div className="space-y-3.5">{children}</div>;
}

export function SignUp() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const [form, setForm] = useState({ name: "", nickname: "", phone: "", email: "", password: "", confirmPassword: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const passwordsMismatch = form.confirmPassword && form.password !== form.confirmPassword;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("auth.signup.imageTypeError"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("auth.signup.imageSizeError"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setProfileImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error(t("auth.signup.passwordMismatch"));
      return;
    }
    setLoading(true);
    try {
      await signup({
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
        nickname: form.nickname,
        profileImage,
      });
      toast.success(t("auth.signup.success"));
      navigate("/login");
    } catch (err) {
      const msg =
        err?.message || (err?.status === 409 ? t("auth.signup.emailTaken") : t("auth.signup.fail"));
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center py-4 sm:py-6">
      <div className={`${authCardClassName} max-w-[400px]`}>
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <span className="text-[15px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t("auth.signup.title")}
          </span>
        </div>

        <div className="px-6 pt-5 pb-5">
          <form onSubmit={handleSignUp} className="space-y-5">
            <FieldGroup>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 shrink-0 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 overflow-hidden hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                  >
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={t("auth.signup.profilePreviewAlt")}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={32} aria-hidden="true" />
                    )}
                  </button>
                  <div className="min-w-0 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                    >
                      {profileImage ? t("auth.signup.profileChange") : t("auth.signup.profilePhoto")}
                    </button>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      {t("auth.signup.profileOptional")}
                    </p>
                  </div>
                </div>
              </div>

              <Field label={t("auth.signup.name")} icon={User}>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={set("name")}
                  className={authInputClassName}
                  placeholder={t("auth.signup.namePlaceholder")}
                />
              </Field>

              <Field label={t("auth.signup.nickname")} icon={MessageSquare}>
                <input
                  type="text"
                  required
                  value={form.nickname}
                  onChange={set("nickname")}
                  className={authInputClassName}
                  placeholder={t("auth.signup.nicknamePlaceholder")}
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field label={t("auth.signup.phone")} icon={Phone}>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={set("phone")}
                  className={authInputClassName}
                  placeholder={t("auth.signup.phonePlaceholder")}
                />
              </Field>

              <Field label={t("auth.signup.email")} icon={Mail}>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={set("email")}
                  className={authInputClassName}
                  placeholder={t("auth.signup.emailPlaceholder")}
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field label={t("auth.signup.password")} icon={Lock}>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={set("password")}
                  className={authInputClassName}
                  placeholder={t("auth.signup.passwordPlaceholder")}
                />
              </Field>

              <div>
                <label className={authLabelClassName}>{t("auth.signup.confirmPassword")}</label>
                <div className="relative">
                  <Lock
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={set("confirmPassword")}
                    className={`${authInputClassName} ${
                      passwordsMismatch ? "border-red-400 dark:border-red-500 focus:border-red-500" : ""
                    }`}
                    placeholder={t("auth.signup.confirmPlaceholder")}
                  />
                </div>
                {passwordsMismatch && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-1.5">{t("auth.signup.passwordMismatch")}</p>
                )}
              </div>
            </FieldGroup>

            <button type="submit" disabled={loading} className={authPrimaryButtonClassName}>
              {loading ? t("auth.signup.submitting") : t("auth.signup.submit")}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            {t("auth.signup.hasAccount")}{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 dark:text-blue-400 no-underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {t("auth.signup.loginLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
