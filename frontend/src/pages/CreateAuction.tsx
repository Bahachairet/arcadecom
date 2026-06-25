import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAppDispatch } from "@/store/hooks";
import { createAuction } from "@/store/slices/auctionsSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, X } from "lucide-react";

export default function CreateAuction() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [minIncrement, setMinIncrement] = useState("");
  const [duration, setDuration] = useState("24");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "seller") {
      navigate("/");
    }
  }, [user, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files].slice(0, 5));
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startingPrice || !minIncrement) return;

    setSubmitting(true);
    try {
      const now = new Date();
      const endTime = new Date(now.getTime() + parseInt(duration) * 3600000);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("startingPrice", startingPrice);
      formData.append("minIncrement", minIncrement);
      formData.append("startTime", now.toISOString());
      formData.append("endTime", endTime.toISOString());
      images.forEach((img) => formData.append("images", img));

      await dispatch(createAuction(formData)).unwrap();
      navigate("/seller/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link
        to="/seller/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Create Auction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Auction title"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Starting Price ($)</label>
                <Input
                  type="number"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Min Increment ($)</label>
                <Input
                  type="number"
                  value={minIncrement}
                  onChange={(e) => setMinIncrement(e.target.value)}
                  placeholder="1.00"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Duration</label>
              <div className="flex gap-2">
                {[
                  { label: "1h", value: "1" },
                  { label: "6h", value: "6" },
                  { label: "24h", value: "24" },
                  { label: "3 days", value: "72" },
                  { label: "7 days", value: "168" },
                ].map((d) => (
                  <Button
                    key={d.value}
                    type="button"
                    variant={duration === d.value ? "default" : "outline"}
                    onClick={() => setDuration(d.value)}
                  >
                    {d.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Images (max 5)</label>
              <div className="flex flex-wrap gap-3">
                {imagePreviews.map((preview, i) => (
                  <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border">
                    <img src={preview} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="h-20 w-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground mt-1">Add</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? "Creating..." : "Create Auction"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
