import { useEffect } from "react";
import { useAppDispatch } from "../store";
import { player } from "../services/audioPlayer";
import {setDuration, setPosition} from "../store/slices/playerSlice";

export default function PlaybackSync() {
    const dispatch = useAppDispatch();
    useEffect(() => {
        const iv = setInterval(() => {
            dispatch(setPosition(player.currentTime));
            dispatch(setDuration(player.duration));
        }, 300);
        return () => clearInterval(iv);
    }, []);
    return null;
}
