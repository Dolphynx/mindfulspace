/**
 * AuthDivider Component
 * Divider with text for OAuth section
 */

export default function AuthDivider({ text }: { text: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-brandBorder" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-white px-4 text-brandText/60">
          {text}
        </span>
      </div>
    </div>
  );
}
