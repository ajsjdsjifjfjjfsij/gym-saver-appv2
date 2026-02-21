"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";

export default function ListYourGymForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Section 1: BASIC GYM DETAILS
    const [gymName, setGymName] = useState("");
    const [gymAddress, setGymAddress] = useState("");
    const [townCity, setTownCity] = useState("");
    const [postCode, setPostCode] = useState("");
    const [googleMapsLink, setGoogleMapsLink] = useState("");

    // Section 2: CONTACT DETAILS
    const [contactName, setContactName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("");

    // Section 3: MEMBERSHIPS
    const [monthlyPrice, setMonthlyPrice] = useState("");
    const [joiningFee, setJoiningFee] = useState("");
    const [studentCorporateDiscounts, setStudentCorporateDiscounts] = useState("");

    // Section 4: SIGN UP / JOIN LINK
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [signUpLink, setSignUpLink] = useState("");

    // Section 5: GYM TYPE & FEATURES
    const [features, setFeatures] = useState({
        is24hr: false,
        budgetGym: false,
        premiumGym: false,
        womenOnly: false,
        bodyBuilding: false,
        crossFit: false,
        strengthConditioning: false,
        classesIncluded: false,
        ptAvailable: false,
        swimmingPool: false,
        saunaSpa: false,
    });

    // Section 6: CURRENT OFFERS
    const [currentOffers, setCurrentOffers] = useState("");

    // Section 7: FEATURED PARTNER OPTION
    const [featuredPartner, setFeaturedPartner] = useState("no");

    // Section 8: IMAGE / MEDIA
    const [gymImage, setGymImage] = useState<File | null>(null);
    const [priceImage, setPriceImage] = useState<File | null>(null);

    // Section 9: CONSENT & AGREEMENT
    const [consentAccurate, setConsentAccurate] = useState(false);
    const [consentDisplay, setConsentDisplay] = useState(false);
    const [consentLink, setConsentLink] = useState(false);

    const handleFeatureChange = (key: keyof typeof features) => {
        setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!consentAccurate || !consentDisplay || !consentLink) {
            setError("You must agree to all consent statements before submitting.");
            return;
        }

        setLoading(true);
        setMessage("");
        setError("");

        try {
            let gymImageUrl = "";
            let priceImageUrl = "";

            // Upload Gym Image
            if (gymImage) {
                const storageRef = ref(storage, `gym-listings/${Date.now()}_img_${gymImage.name}`);
                await uploadBytes(storageRef, gymImage);
                gymImageUrl = await getDownloadURL(storageRef);
            }

            // Upload Price Image
            if (priceImage) {
                const storageRef = ref(storage, `gym-listings/${Date.now()}_price_${priceImage.name}`);
                await uploadBytes(storageRef, priceImage);
                priceImageUrl = await getDownloadURL(storageRef);
            }

            // Build flattened features string array
            const selectedFeatures = Object.entries(features)
                .filter(([_, isSelected]) => isSelected)
                .map(([key, _]) => {
                    // Convert camelCase key back to readable text (optional helper formatting)
                    const formatted = key.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
                    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
                });

            // Generate a unique submission ID
            const submissionId = `WEB-SUB-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

            await addDoc(collection(db, "pending_gym_listings"), {
                submission_id: submissionId,
                submission_source: "list_your_gym",
                gym_name: gymName,
                address: gymAddress,
                city: townCity,
                postcode: postCode,
                contact_name: contactName,
                email,
                phone,
                website: websiteUrl,
                join_link: signUpLink,
                price_monthly: parseFloat(monthlyPrice) || 0,
                joining_fee: parseFloat(joiningFee) || 0, // Adding this per standard info
                student_corporate_discounts: studentCorporateDiscounts,
                features: selectedFeatures,
                offers: currentOffers,
                featured_request: featuredPartner === "yes",
                partner_status: featuredPartner === "yes" ? "Featured" : "Free",
                partner_updatedAt: new Date(),
                status: "pending",
                created_at: new Date(),
                place_id: "", // Empty initial place_id for admin to populate later
                // Keeping media references for admin review
                media: {
                    gymImageUrl,
                    priceImageUrl,
                }
            });

            setMessage(featuredPartner === "yes" ? "If you Opted Yes for featured we will be in contact shortly" : "Listing submitted successfully!");

            // Clear form
            setGymName(""); setGymAddress(""); setTownCity(""); setPostCode(""); setGoogleMapsLink("");
            setContactName(""); setEmail(""); setPhone(""); setRole("");
            setMonthlyPrice(""); setJoiningFee(""); setStudentCorporateDiscounts("");
            setWebsiteUrl(""); setSignUpLink("");
            setFeatures({
                is24hr: false, budgetGym: false, premiumGym: false, womenOnly: false, bodyBuilding: false,
                crossFit: false, strengthConditioning: false, classesIncluded: false, ptAvailable: false,
                swimmingPool: false, saunaSpa: false,
            });
            setCurrentOffers(""); setFeaturedPartner("no");
            setGymImage(null); setPriceImage(null);
            setConsentAccurate(false); setConsentDisplay(false); setConsentLink(false);

            // Show clean success page
            setIsSubmitted(true);

        } catch (err: any) {
            console.error("Error submitting gym listing:", err);
            setError("Failed to submit listing. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <Card className="w-full max-w-2xl mx-auto bg-black border border-[#6BD85E]/30 neon-glow-card shadow-[0_0_30px_rgba(107,216,94,0.2)] text-center py-16">
                <CardHeader>
                    <div className="mx-auto w-24 h-24 bg-[#6BD85E]/10 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="w-12 h-12 text-[#6BD85E]" />
                    </div>
                    <CardTitle className="text-4xl font-bold text-white mb-4">Thank You!</CardTitle>
                    <CardDescription className="text-xl text-slate-300 max-w-md mx-auto leading-relaxed">
                        Your gym has been submitted to GymSaver. We will review your listing and contact you shortly.
                    </CardDescription>
                </CardHeader>
                <CardContent className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                    <Button onClick={() => router.push('/')} className="bg-zinc-900 border border-white/10 hover:bg-zinc-800 hover:text-white text-slate-300 h-12 px-8">
                        Return Home
                    </Button>
                    <Button onClick={() => {
                        setIsSubmitted(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} className="bg-[#6BD85E] hover:bg-[#5bc250] text-black font-bold h-12 px-8">
                        Submit Another
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full bg-black border border-white/10 neon-glow-card shadow-[0_0_20px_rgba(107,216,94,0.3)]">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-[#6BD85E]">List Your Gym</CardTitle>
                <CardDescription className="text-slate-400">
                    Join GymSaver to reach thousands of users looking for their next fitness home.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* SECTION 1: BASIC GYM DETAILS */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">1. Basic Gym Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="gymName" className="text-white">Gym Name <span className="text-red-500">*</span></Label>
                                <Input id="gymName" value={gymName} onChange={(e) => setGymName(e.target.value)} required className="bg-zinc-900 border-white/10 text-white focus-visible:ring-[#6BD85E]" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gymAddress" className="text-white">Gym Address <span className="text-red-500">*</span></Label>
                                <Input id="gymAddress" value={gymAddress} onChange={(e) => setGymAddress(e.target.value)} required className="bg-zinc-900 border-white/10 text-white focus-visible:ring-[#6BD85E]" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="townCity" className="text-white">Town/City <span className="text-red-500">*</span></Label>
                                <Input id="townCity" value={townCity} onChange={(e) => setTownCity(e.target.value)} required className="bg-zinc-900 border-white/10 text-white focus-visible:ring-[#6BD85E]" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="postCode" className="text-white">Post Code <span className="text-red-500">*</span></Label>
                                <Input id="postCode" value={postCode} onChange={(e) => setPostCode(e.target.value)} required className="bg-zinc-900 border-white/10 text-white focus-visible:ring-[#6BD85E]" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="googleMapsLink" className="text-white">Google Maps Link (Optional)</Label>
                                <Input id="googleMapsLink" type="url" value={googleMapsLink} onChange={(e) => setGoogleMapsLink(e.target.value)} placeholder="https://maps.google.com/..." className="bg-zinc-900 border-white/10 text-white focus-visible:ring-[#6BD85E]" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: CONTACT DETAILS */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">2. Contact Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contactName" className="text-white">Contact Name <span className="text-red-500">*</span></Label>
                                <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} required className="bg-zinc-900 border-white/10 text-white focus-visible:ring-[#6BD85E]" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-white">Email Address <span className="text-red-500">*</span></Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-zinc-900 border-white/10 text-white focus-visible:ring-[#6BD85E]" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-white">Phone Number <span className="text-red-500">*</span></Label>
                                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="bg-zinc-900 border-white/10 text-white focus-visible:ring-[#6BD85E]" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-white">Role <span className="text-red-500">*</span></Label>
                                <Select value={role} onValueChange={setRole} required>
                                    <SelectTrigger className="bg-zinc-900 border-white/10 text-white focus:ring-[#6BD85E]">
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                        <SelectItem value="Owner">Owner</SelectItem>
                                        <SelectItem value="Manager">Manager</SelectItem>
                                        <SelectItem value="Marketing">Marketing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: MEMBERSHIPS */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">3. Memberships</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="monthlyPrice" className="text-white">Monthly Membership Price (Current) (£) <span className="text-red-500">*</span></Label>
                                <Input id="monthlyPrice" type="number" min="0" step="0.01" value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} required className="bg-zinc-900 border-white/10 text-white focus-visible:ring-[#6BD85E]" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="joiningFee" className="text-white">Joining Fee (£) <span className="text-red-500">*</span></Label>
                                <Input id="joiningFee" type="number" min="0" step="0.01" value={joiningFee} onChange={(e) => setJoiningFee(e.target.value)} required className="bg-zinc-900 border-white/10 text-white focus-visible:ring-[#6BD85E]" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="discounts" className="text-white">Student Discounts / Corporate (Optional)</Label>
                                <Textarea id="discounts" value={studentCorporateDiscounts} onChange={(e) => setStudentCorporateDiscounts(e.target.value)} className="bg-zinc-900 border-white/10 text-white focus-visible:ring-[#6BD85E]" placeholder="Detail any discounts here..." />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: SIGN UP / JOIN LINK */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">4. Sign Up / Join Link</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="websiteUrl" className="text-white">Website URL <span className="text-red-500">*</span></Label>
                                <Input id="websiteUrl" type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} required placeholder="https://..." className="bg-zinc-900 border-white/10 text-white focus-visible:ring-[#6BD85E]" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signUpLink" className="text-white">Direct Join / Sign Up Link <span className="text-red-500">*</span></Label>
                                <Input id="signUpLink" type="url" value={signUpLink} onChange={(e) => setSignUpLink(e.target.value)} required placeholder="https://..." className="bg-zinc-900 border-white/10 text-white focus-visible:ring-[#6BD85E]" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: GYM TYPE & FEATURES */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">5. Gym Type & Features</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                { id: 'is24hr', label: '24hr Gym' },
                                { id: 'budgetGym', label: 'Budget Gym' },
                                { id: 'premiumGym', label: 'Premium Gym' },
                                { id: 'womenOnly', label: 'Women Only Gym' },
                                { id: 'bodyBuilding', label: 'Body Building' },
                                { id: 'crossFit', label: 'Cross Fit' },
                                { id: 'strengthConditioning', label: 'Strength & Conditioning' },
                                { id: 'classesIncluded', label: 'Classes Included' },
                                { id: 'ptAvailable', label: 'PT Available' },
                                { id: 'swimmingPool', label: 'Swimming Pool' },
                                { id: 'saunaSpa', label: 'Sauna/Spa' },
                            ].map((feature) => (
                                <div key={feature.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={feature.id}
                                        checked={features[feature.id as keyof typeof features]}
                                        onCheckedChange={() => handleFeatureChange(feature.id as keyof typeof features)}
                                        className="border-white/50 data-[state=checked]:bg-[#6BD85E] data-[state=checked]:text-black"
                                    />
                                    <Label htmlFor={feature.id} className="text-sm text-slate-300 font-medium cursor-pointer">{feature.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 6: CURRENT OFFERS */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">6. Current Offers</h3>
                        <div className="space-y-2">
                            <Label htmlFor="currentOffers" className="text-white">Current Promotions / Offers (Optional)</Label>
                            <Textarea id="currentOffers" value={currentOffers} onChange={(e) => setCurrentOffers(e.target.value)} className="bg-zinc-900 border-white/10 text-white focus-visible:ring-[#6BD85E]" placeholder='e.g. "No joining fee this month"' />
                        </div>
                    </div>

                    {/* SECTION 7: FEATURED PARTNER OPTION */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">7. Featured Partner Option</h3>
                        <RadioGroup value={featuredPartner} onValueChange={setFeaturedPartner} className="space-y-2">
                            <div className="flex items-center space-x-2 bg-zinc-900/50 p-3 rounded-lg border border-white/5">
                                <RadioGroupItem value="yes" id="featured-yes" className="border-white/50 text-[#6BD85E]" />
                                <Label htmlFor="featured-yes" className="text-white cursor-pointer font-medium">Yes, I want to be listed for my area above competitors.</Label>
                            </div>
                            <div className="flex items-center space-x-2 bg-zinc-900/50 p-3 rounded-lg border border-white/5">
                                <RadioGroupItem value="no" id="featured-no" className="border-white/50 text-[#6BD85E]" />
                                <Label htmlFor="featured-no" className="text-white cursor-pointer font-medium">No, free listing is fine.</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* SECTION 8: IMAGE / MEDIA */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">8. Image / Media</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="gymImage" className="text-white">Upload Gym Images <span className="text-red-500">*</span></Label>
                                <Input id="gymImage" type="file" accept="image/*" required onChange={(e) => setGymImage(e.target.files?.[0] || null)} className="bg-zinc-900 border-white/10 text-white file:text-[#6BD85E] file:bg-zinc-800 file:border-0 file:mr-4 file:px-4 file:py-2 file:rounded-xl hover:file:bg-zinc-700" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priceImage" className="text-white">Upload Membership Price Image (Optional)</Label>
                                <Input id="priceImage" type="file" accept="image/*" onChange={(e) => setPriceImage(e.target.files?.[0] || null)} className="bg-zinc-900 border-white/10 text-white file:text-[#6BD85E] file:bg-zinc-800 file:border-0 file:mr-4 file:px-4 file:py-2 file:rounded-xl hover:file:bg-zinc-700" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 9: CONSENT & AGREEMENT */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">9. Consent & Agreement</h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-2">
                                <Checkbox id="consent1" checked={consentAccurate} onCheckedChange={(c) => setConsentAccurate(c === true)} className="mt-1 border-white/50 data-[state=checked]:bg-[#6BD85E] data-[state=checked]:text-black" />
                                <Label htmlFor="consent1" className="text-sm text-slate-300 font-medium cursor-pointer leading-tight">I confirm the information provided is accurate <span className="text-red-500">*</span></Label>
                            </div>
                            <div className="flex items-start space-x-2">
                                <Checkbox id="consent2" checked={consentDisplay} onCheckedChange={(c) => setConsentDisplay(c === true)} className="mt-1 border-white/50 data-[state=checked]:bg-[#6BD85E] data-[state=checked]:text-black" />
                                <Label htmlFor="consent2" className="text-sm text-slate-300 font-medium cursor-pointer leading-tight">I agree to GymSaver displaying this information on its platform <span className="text-red-500">*</span></Label>
                            </div>
                            <div className="flex items-start space-x-2">
                                <Checkbox id="consent3" checked={consentLink} onCheckedChange={(c) => setConsentLink(c === true)} className="mt-1 border-white/50 data-[state=checked]:bg-[#6BD85E] data-[state=checked]:text-black" />
                                <Label htmlFor="consent3" className="text-sm text-slate-300 font-medium cursor-pointer leading-tight">I agree Gymsaver may link users to our website <span className="text-red-500">*</span></Label>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 10: SUBMIT BUTTON */}
                    <div className="pt-4 border-t border-white/10">
                        {message && <div className="mb-4 p-4 rounded-xl bg-[#6BD85E]/20 text-[#6BD85E] text-center font-bold border border-[#6BD85E]/50">{message}</div>}
                        {error && <div className="mb-4 p-4 rounded-xl bg-red-500/20 text-red-500 text-center font-bold border border-red-500/50">{error}</div>}
                        <Button type="submit" disabled={loading} className="w-full h-14 text-lg bg-[#6BD85E] hover:bg-[#5bc250] text-black font-bold shadow-[0_0_20px_rgba(107,216,94,0.3)] hover:shadow-[0_0_30px_rgba(107,216,94,0.5)] transition-all">
                            {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : null}
                            Submit Your Listing
                        </Button>
                    </div>

                </form>
            </CardContent>
        </Card>
    );
}
