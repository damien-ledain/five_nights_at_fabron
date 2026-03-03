package fr.univ.fabron.fnaf_fabron.score;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leaderboard")
@CrossOrigin(origins = "*") 
public class ScoreController {

    private final ScoreRepository scoreRepository;

    public ScoreController(ScoreRepository scoreRepository) {
        this.scoreRepository = scoreRepository;
    }

    @GetMapping
    public List<Map<String, Object>> getLeaderboard() {
        return scoreRepository.findTop10ByOrderByScoreValueDesc().stream().map(score -> {
            Map<String, Object> map = new HashMap<>();
            map.put("playerName", score.getPlayer().getUsername());
            map.put("scoreValue", score.getScoreValue());
            return map;
        }).collect(Collectors.toList());
    }
}